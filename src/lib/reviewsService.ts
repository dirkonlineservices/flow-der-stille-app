import { getSupabase } from './supabaseClient';

export interface ProductReview {
  id: string;
  produkt_id: string;
  user_id: string;
  sterne: number;
  kommentar?: string | null;
  created_at?: string;
}

export interface ProductRatingSummary {
  average: number;
  count: number;
  userRating?: number | null;
}

const LOCAL_REVIEWS_KEY = 'flow_local_product_reviews';

const getLocalReviews = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalReview = (produktId: string, sterne: number) => {
  try {
    const current = getLocalReviews();
    current[produktId] = sterne;
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save local review:', e);
  }
};

/**
 * Ruft alle aggregierten Bewertungen fuer alle Produkte ab.
 */
export async function getAllProductRatings(): Promise<Record<string, { average: number; count: number }>> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('produkt_bewertungen')
      .select('produkt_id, sterne');

    if (error || !data) {
      return {};
    }

    const ratingsMap: Record<string, { sum: number; count: number }> = {};
    for (const item of data) {
      if (!ratingsMap[item.produkt_id]) {
        ratingsMap[item.produkt_id] = { sum: 0, count: 0 };
      }
      ratingsMap[item.produkt_id].sum += item.sterne;
      ratingsMap[item.produkt_id].count += 1;
    }

    const result: Record<string, { average: number; count: number }> = {};
    for (const [prodId, val] of Object.entries(ratingsMap)) {
      result[prodId] = {
        average: Number((val.sum / val.count).toFixed(1)),
        count: val.count
      };
    }
    return result;
  } catch (err) {
    console.warn('Could not fetch all product ratings:', err);
    return {};
  }
}

/**
 * Prueft ob der Nutzer ein Produkt bereits bewertet hat und gibt Sterne + Kommentar zurueck
 */
export async function getUserProductReview(produktId: string, userId?: string): Promise<{ sterne: number; kommentar?: string } | null> {
  if (!userId) {
    const localSterne = getLocalReviews()[produktId];
    return localSterne ? { sterne: localSterne } : null;
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('produkt_bewertungen')
      .select('sterne, kommentar')
      .eq('produkt_id', produktId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data?.sterne) {
      saveLocalReview(produktId, data.sterne);
      return { sterne: data.sterne, kommentar: data.kommentar || undefined };
    }
  } catch (err) {
    console.warn('Error checking user review:', err);
  }

  const localVal = getLocalReviews()[produktId];
  return localVal ? { sterne: localVal } : null;
}

/**
 * Speichert oder aktualisiert eine Produktbewertung (1-5 Sterne) und sendet eine E-Mail-Benachrichtigung an das Team.
 */
export async function submitProductReview(
  produktId: string,
  userId: string,
  sterne: number,
  kommentar?: string,
  userEmail?: string,
  userName?: string,
  produktTitel?: string
): Promise<{ success: boolean; error?: string }> {
  if (sterne < 1 || sterne > 5) {
    return { success: false, error: 'Bewertung muss zwischen 1 und 5 Sternen liegen.' };
  }

  saveLocalReview(produktId, sterne);

  const supabase = getSupabase();

  try {
    // 1. In Supabase Tabelle produkt_bewertungen speichern / aktualisieren
    const { data: existing } = await supabase
      .from('produkt_bewertungen')
      .select('id')
      .eq('produkt_id', produktId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('produkt_bewertungen')
        .update({
          sterne,
          kommentar: kommentar?.trim() || null
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('produkt_bewertungen')
        .insert({
          produkt_id: produktId,
          user_id: userId,
          sterne,
          kommentar: kommentar?.trim() || null
        });

      if (insertError) throw insertError;
    }
  } catch (err: any) {
    console.error('Error submitting review to Supabase:', err);
  }

  // 2. E-Mail-Benachrichtigung an Dirk & Team senden
  try {
    const isCritical = sterne <= 2;
    const title = produktTitel || produktId;
    const starsEmoji = '⭐'.repeat(sterne);

    await supabase.functions.invoke('smart-responder', {
      body: {
        name: userName || userEmail || 'Registrierter Nutzer',
        email: userEmail || 'keine-email@flow-der-stille.de',
        message: `[${isCritical ? '⚠️ KRITISCHE BEWERTUNG' : '⭐ NEUE BEWERTUNG'}] Flow der Stille\n\n` +
          `Produkt: ${title} (ID: ${produktId})\n` +
          `Bewertung: ${starsEmoji} (${sterne} von 5 Sternen)\n` +
          `Nutzer: ${userName || 'Kunde'} <${userEmail || 'Nicht angegeben'}>\n` +
          `Nutzer-ID: ${userId}\n` +
          `Datum: ${new Date().toLocaleString('de-DE')}\n\n` +
          `Feedback / Begründung des Nutzers:\n` +
          `${kommentar?.trim() ? `"${kommentar.trim()}"` : '(Kein schriftlicher Text angegeben)'}\n\n` +
          `-----------------------------------------\n` +
          `${isCritical 
            ? '⚠️ ACHTUNG: Der Nutzer hat 1 oder 2 Sterne vergeben. Bitte antworte direkt auf diese E-Mail, um persönlich auf das Feedback einzugehen!' 
            : 'Du kannst bei Rückfragen direkt auf diese E-Mail antworten, um den Nutzer zu kontaktieren.'}`,
        honeypot: ''
      }
    });
  } catch (emailErr) {
    console.warn('Could not dispatch rating email notification:', emailErr);
  }

  return { success: true };
}
