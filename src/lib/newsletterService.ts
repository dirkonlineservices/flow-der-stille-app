import { getSupabase, normalizeEmail } from './supabaseClient';

export interface NewsletterSubscriptionParams {
  email: string;
  firstName?: string;
  userId?: string;
  source?: string;
}

/**
 * Triggers the Double Opt-In (DOI) email via Supabase Edge Function 'send-double-opt-in-email'
 */
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
    
    // UI Feedback: Erfolgsmeldung im Overlay anzeigen
    console.log("DOI E-Mail versendet", data);
    return { success: true, data };
  } catch (err) {
    // UI Feedback: Fehler abfangen
    console.error("Fehler beim DOI Versand", err);
    return { success: false, error: err };
  }
};

/**
 * Subscribes a user to the newsletter:
 * 1. Writes an entry directly to the Supabase 'newsletter' table with confirm_token.
 * 2. Writes a fallback entry to 'newsletter_leads'.
 * 3. Triggers the Edge Function send-double-opt-in-email.
 * 4. Triggers backend welcome email fallback via Resend API.
 */
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

  let dbSuccess = false;

  // 1. Direct write to Supabase 'newsletter_leads' table
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
      console.warn('Supabase newsletter_leads upsert warning, trying simple insert:', newsletterErr.message);
      const { error: insertErr } = await supabase
        .from('newsletter_leads')
        .insert({
          email: normalized,
          status: 'pending_doi',
          confirm_token: generatedToken,
          source,
          updated_at: new Date().toISOString()
        });
      if (!insertErr) dbSuccess = true;
    } else {
      dbSuccess = true;
    }
  } catch (err) {
    console.warn('Exception during newsletter_leads table write:', err);
  }

  // 2. Secondary write to 'newsletter_leads' table as fallback
  try {
    await supabase
      .from('newsletter_leads')
      .insert([
        {
          email: normalized,
          status: 'pending_doi',
          confirm_token: generatedToken,
          source
        }
      ]);
  } catch (e) {
    // non-fatal
  }

  // 3. Trigger Double Opt-In Email Edge Function directly after DB insert
  await triggerDoiEmail(normalized, generatedToken);

  // 4. Automated welcome email dispatch fallback via backend server (Resend)
  try {
    await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: normalized,
        firstName: firstName || '',
        userId,
        source,
        confirm_token: generatedToken
      })
    });
  } catch (emailErr) {
    console.warn('Automated newsletter email call warning:', emailErr);
  }

  return { success: true, message: 'Erfolgreich zum Newsletter angemeldet.', token: generatedToken };
}

/**
 * Unsubscribes a user from the newsletter:
 * 1. Updates entry in Supabase 'newsletter' table to 'unsubscribed'.
 * 2. Updates 'newsletter_leads' entry.
 * 3. Calls backend unsubscribe API endpoint.
 */
export async function unsubscribeFromNewsletter({
  email,
  userId
}: {
  email: string;
  userId?: string;
}): Promise<{ success: boolean; message?: string }> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabase();

  // 1. Update Supabase 'newsletter_leads' table
  try {
    await supabase
      .from('newsletter_leads')
      .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
      .eq('email', normalized);
  } catch (e) {
    console.warn('Supabase newsletter_leads unsubscribe error:', e);
  }

  // 2. Update Supabase 'newsletter_leads' table
  try {
    await supabase
      .from('newsletter_leads')
      .update({ status: 'unsubscribed' })
      .eq('email', normalized);
  } catch (e) {
    // non-fatal
  }

  // 3. Call backend unsubscribe endpoint
  try {
    await fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: normalized, userId })
    });
  } catch (e) {
    console.warn('Backend newsletter unsubscribe error:', e);
  }

  return { success: true, message: 'Erfolgreich vom Newsletter abgemeldet.' };
}
