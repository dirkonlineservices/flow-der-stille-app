import { getSupabase, normalizeEmail } from './supabaseClient';
import { trackMetaLead } from './metaPixel';

export type GewinnspielErgebnis = 'ok' | 'bereits_teilgenommen' | 'nicht_offen' | 'ungueltig' | 'fehler';

/**
 * Trägt eine Teilnahme an der Adventskalender-Verlosung ein (Tage 6, 13, 21).
 * Unabhängig vom Newsletter. Teilnahmeschluss und „einmal je Person“ prüft der Server
 * (Funktion gewinnspiel_teilnehmen, siehe supabase/migrations/20261121_*).
 */
export async function teilnehmenAmGewinnspiel(
  tag: number,
  email: string,
  antwort: string
): Promise<GewinnspielErgebnis> {
  try {
    const { data, error } = await getSupabase().rpc('gewinnspiel_teilnehmen', {
      p_tag: tag,
      p_email: normalizeEmail(email),
      p_antwort: antwort
    });
    if (error) return 'fehler';
    const ergebnis = (data as GewinnspielErgebnis) || 'fehler';
    if (ergebnis === 'ok') trackMetaLead(`Adventskalender Gewinnspiel Tag ${tag}`);
    return ergebnis;
  } catch {
    return 'fehler';
  }
}
