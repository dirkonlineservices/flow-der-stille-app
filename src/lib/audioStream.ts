/**
 * audioStream.ts – Geschütztes Audio-Streaming über den Cloudflare Worker.
 *
 * Ablauf:
 *  1. Supabase-Session des Nutzers holen (ohne Session: LoginRequiredError).
 *  2. POST {AUDIO_BASE_URL}/link/{produktId} mit Bearer-Token.
 *  3. Bei 401 einmal die Session erneuern und wiederholen.
 *  4. Bei 403 NoAccessError (UI zeigt Kaufen bzw. Freischalten).
 *  5. Die zurückgegebene Kurzzeit-URL (10 Minuten gültig) direkt als Player-Quelle nutzen.
 *
 * Die Stream-URL wird nicht gespeichert, nicht geteilt und nicht geloggt.
 * Für jeden Start eines Audios wird ein neuer Link geholt.
 */

import { getSupabase } from './supabaseClient';
import { AUDIO_BASE_URL } from '../config/audio';
import { getOfflineProducts } from './offlineProductsService';

/** Gültigkeit laut Worker: 600 Sekunden. Wir erneuern etwas früher. */
export const STREAM_LINK_TTL_MS = 9 * 60 * 1000;

export class LoginRequiredError extends Error {
  constructor(message = 'Login erforderlich') {
    super(message);
    this.name = 'LoginRequiredError';
  }
}

export class NoAccessError extends Error {
  constructor(message = 'Kein Zugriff auf dieses Audio') {
    super(message);
    this.name = 'NoAccessError';
  }
}

export class AudioUnavailableError extends Error {
  constructor(message = 'Audio gerade nicht verfügbar') {
    super(message);
    this.name = 'AudioUnavailableError';
  }
}

async function requestLink(produktId: string, accessToken: string): Promise<Response> {
  return fetch(`${AUDIO_BASE_URL}/link/${encodeURIComponent(produktId)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * Holt eine kurzlebige, signierte Stream-URL für ein Produkt.
 */
export async function getAudioStreamUrl(produktId: string): Promise<string> {
  if (!produktId) throw new AudioUnavailableError();

  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new LoginRequiredError();

  let res: Response;
  try {
    res = await requestLink(produktId, session.access_token);

    if (res.status === 401) {
      const { data: refreshed, error } = await supabase.auth.refreshSession();
      const token = refreshed?.session?.access_token;
      if (error || !token) throw new LoginRequiredError();
      res = await requestLink(produktId, token);
    }
  } catch (e) {
    if (e instanceof LoginRequiredError) throw e;
    throw new AudioUnavailableError();
  }

  if (res.status === 401) throw new LoginRequiredError();
  if (res.status === 403) throw new NoAccessError();
  if (!res.ok) throw new AudioUnavailableError();

  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new AudioUnavailableError();
  }
  if (!body?.url || typeof body.url !== 'string') throw new AudioUnavailableError();
  return body.url;
}

/**
 * Ermittelt, ob ein Produkt kostenlos ist (preis = 0).
 * Nutzt den Preis am Objekt, sonst den gebündelten bzw. gecachten Katalog (exakte ID).
 */
export function isFreeProduct(produkt: { id?: string; preis?: number | string | null } | null | undefined): boolean {
  if (!produkt) return false;
  if (produkt.preis !== undefined && produkt.preis !== null && produkt.preis !== '') {
    return Number(produkt.preis) === 0;
  }
  const match = getOfflineProducts().find((p) => p.id === produkt.id);
  return !!match && Number(match.preis) === 0;
}

/**
 * Schaltet ein Gratis-Produkt (preis = 0) für den eingeloggten Nutzer frei,
 * indem ein Eintrag in `kaeufe` angelegt wird. Nur für 0-€-Produkte verwenden.
 * Bezahlprodukte laufen ausschließlich über die Edge Functions.
 */
export async function unlockFreeProduct(produktId: string): Promise<void> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new LoginRequiredError();

  const { error } = await supabase
    .from('kaeufe')
    .insert({ user_id: userId, produkt_id: produktId, preis: 0 });

  // 23505 = Eintrag existiert bereits (unique user_id, produkt_id)
  if (error && error.code !== '23505') {
    // Kein Kauf-Dialog für Gratis-Produkte: stattdessen Hinweis „nicht verfügbar“
    throw new AudioUnavailableError('Freischaltung fehlgeschlagen');
  }
}

/**
 * Wie getAudioStreamUrl, schaltet aber Gratis-Produkte bei 403 automatisch frei
 * (Eintrag in kaeufe mit preis 0) und versucht es dann einmal erneut.
 */
export async function resolveAudioStreamUrl(
  produkt: { id: string; preis?: number | string | null }
): Promise<string> {
  try {
    return await getAudioStreamUrl(produkt.id);
  } catch (e) {
    if (e instanceof NoAccessError && isFreeProduct(produkt)) {
      await unlockFreeProduct(produkt.id);
      return await getAudioStreamUrl(produkt.id);
    }
    throw e;
  }
}
