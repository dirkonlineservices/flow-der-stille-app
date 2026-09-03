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
 * Gibt ein Mapping { [produkt_id]: { average: 4.8, count: 12 } } zurueck.
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
 * Prueft ob der Nutzer ein Produkt bereits bewertet hat
 */
export async function getUserProductReview(produktId: string, userId?: string): Promise<number | null> {
  const localVal = getLocalReviews()[produktId];
  if (localVal) return localVal;

  if (!userId) return null;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('produkt_bewertungen')
      .select('sterne')
      .eq('produkt_id', produktId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data?.sterne) {
      saveLocalReview(produktId, data.sterne);
      return data.sterne;
    }
  } catch (err) {
    console.warn('Error checking user review:', err);
  }
  return null;
}

/**
 * Speichert oder aktualisiert eine Produktbewertung (1-5 Sterne)
 */
export async function submitProductReview(
  produktId: string,
  userId: string,
  sterne: number,
  kommentar?: string
): Promise<{ success: boolean; error?: string }> {
  if (sterne < 1 || sterne > 5) {
    return { success: false, error: 'Bewertung muss zwischen 1 und 5 Sternen liegen.' };
  }

  saveLocalReview(produktId, sterne);

  try {
    const supabase = getSupabase();

    // Pruefen, ob bereits eine Bewertung existiert
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
          kommentar: kommentar || null
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
          kommentar: kommentar || null
        });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error submitting review to Supabase:', err);
    // Offline / LocalStorage hat die Bewertung bereits gespeichert
    return { success: true };
  }
}
