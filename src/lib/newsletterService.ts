import { getSupabase, normalizeEmail } from './supabaseClient';
import { reportCriticalError } from './errorLogger';

export interface NewsletterSubscriptionParams {
  email: string;
  firstName?: string;
  userId?: string;
  source?: string;
}

export const triggerDoiEmail = async (userEmail: string, generatedToken: string) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.functions.invoke('send-double-opt-in-email', {
      body: JSON.stringify({ 
        email: userEmail,
        confirm_token: generatedToken 
      })
    });

    if (error) throw error;
    console.log("DOI E-Mail versendet", data);
    return { success: true, data };
  } catch (err) {
    console.error("Fehler beim DOI Versand", err);
    await reportCriticalError({
      context: 'Newsletter DOI E-Mail Versand',
      error: err,
      userEmail
    });
    return { success: false, error: err };
  }
};

/** Fehler „Funktion existiert nicht“: SQL-Migration noch nicht eingespielt -> alter Weg. */
const isMissingFunction = (err: any) =>
  !!err && (err.code === 'PGRST202' || /could not find the function/i.test(err.message || ''));

const makeLegacyToken = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'doi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

/**
 * Legt die Anmeldung an bzw. erneuert den Bestätigungs-Token (serverseitig über
 * die Funktion newsletter_request_doi). Gibt den Token zurück, oder null, wenn die
 * Adresse bereits bestätigt ist.
 */
export async function requestNewsletterDoi(email: string, source: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('newsletter_request_doi', {
    p_email: normalized,
    p_source: source
  });

  if (!error) return (data as string | null) ?? null;

  if (!isMissingFunction(error)) throw error;

  // Übergang: Funktion noch nicht vorhanden -> bisheriger direkter Weg
  const token = makeLegacyToken();
  const { error: upsertErr } = await supabase
    .from('newsletter_leads')
    .upsert({
      email: normalized,
      status: 'pending_doi',
      confirm_token: token,
      source,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });
  if (upsertErr) {
    await supabase.from('newsletter_leads').insert({
      email: normalized,
      status: 'pending_doi',
      confirm_token: token,
      source,
      updated_at: new Date().toISOString()
    });
  }
  return token;
}

/** Bestätigt die Anmeldung nur mit dem passenden Token aus der Mail. */
export async function confirmNewsletter(email: string, token: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('newsletter_confirm', {
    p_email: normalizeEmail(email),
    p_token: token
  });
  if (!error) return data === true;
  if (!isMissingFunction(error)) throw error;

  // Übergang: Funktion noch nicht vorhanden -> bisheriger direkter Weg
  const nowIso = new Date().toISOString();
  const { error: upsertErr } = await supabase
    .from('newsletter_leads')
    .upsert({
      email: normalizeEmail(email),
      status: 'confirmed',
      confirm_token: null,
      confirmed_at: nowIso,
      updated_at: nowIso,
      source: 'landing_page_confirmation'
    }, { onConflict: 'email' });
  if (upsertErr) throw upsertErr;
  return true;
}

/** Status des angemeldeten Nutzers (nur eigene Adresse). */
export async function getMyNewsletterStatus(): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('newsletter_my_status');
  if (error) return null;
  return (data as string | null) ?? null;
}

export async function subscribeToNewsletter({
  email,
  source = 'app_registration'
}: NewsletterSubscriptionParams): Promise<{ success: boolean; message?: string; token?: string }> {
  const normalized = normalizeEmail(email);

  let token: string | null = null;
  try {
    token = await requestNewsletterDoi(normalized, source);
  } catch (err) {
    console.warn('Newsletter-Anmeldung fehlgeschlagen:', err);
    return { success: false, message: 'Die Anmeldung hat gerade nicht geklappt. Bitte versuche es gleich noch einmal.' };
  }

  if (!token) {
    return { success: true, message: 'Du bist bereits für den Newsletter angemeldet.' };
  }

  await triggerDoiEmail(normalized, token);

  return { success: true, message: 'Erfolgreich zum Newsletter angemeldet.', token };
}

export async function unsubscribeFromNewsletter({
  email
}: {
  email: string;
  userId?: string;
}): Promise<{ success: boolean; message?: string }> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabase();

  try {
    const { error } = await supabase.rpc('newsletter_unsubscribe', { p_email: normalized });
    if (error && isMissingFunction(error)) {
      await supabase
        .from('newsletter_leads')
        .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
        .eq('email', normalized);
    } else if (error) {
      throw error;
    }
  } catch (e) {
    console.warn('Newsletter-Abmeldung fehlgeschlagen:', e);
    return { success: false, message: 'Die Abmeldung hat gerade nicht geklappt. Bitte versuche es gleich noch einmal.' };
  }

  return { success: true, message: 'Erfolgreich vom Newsletter abgemeldet.' };
}
