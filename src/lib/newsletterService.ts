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

export async function subscribeToNewsletter({
  email,
  firstName,
  userId,
  source = 'app_registration'
}: NewsletterSubscriptionParams): Promise<{ success: boolean; message?: string; token?: string }> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabase();

  const generatedToken = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'doi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

  try {
    const { error: newsletterErr } = await supabase
      .from('newsletter_leads')
      .upsert({
        email: normalized,
        status: 'pending_doi',
        confirm_token: generatedToken,
        source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (newsletterErr) {
      await supabase
        .from('newsletter_leads')
        .insert({
          email: normalized,
          status: 'pending_doi',
          confirm_token: generatedToken,
          source,
          updated_at: new Date().toISOString()
        });
    }
  } catch (err) {
    console.warn('Exception during newsletter_leads table write:', err);
  }

  await triggerDoiEmail(normalized, generatedToken);

  return { success: true, message: 'Erfolgreich zum Newsletter angemeldet.', token: generatedToken };
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
    await supabase
      .from('newsletter_leads')
      .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
      .eq('email', normalized);
  } catch (e) {
    console.warn('Supabase newsletter_leads unsubscribe error:', e);
  }

  return { success: true, message: 'Erfolgreich vom Newsletter abgemeldet.' };
}
