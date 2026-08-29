/**
 * consentManager.ts
 *
 * Persistentes, reibungsarmes Zustimmungssystem für Audio-Inhalte.
 * - Gast: anonyme guest_session_id im localStorage
 * - Eingeloggter Nutzer: user_id + Sync mit Supabase user_consents
 * - GA4 dataLayer-Event bei jeder Bestätigung
 */

import { getSupabase } from './supabaseClient';

export type AudioCategory = 'sample' | 'meditation' | 'hypnosis' | 'audiobook';

const LS_CONSENT_KEY  = 'fds_audio_consent_granted';
const LS_GUEST_ID_KEY = 'fds_guest_session_id';

// Hilfsfunktionen ─────────────────────────────────────────────────────────────

/** Gibt die guest_session_id zurück – erzeugt sie beim ersten Aufruf (UUID v4). */
export function getOrCreateGuestSessionId(): string {
  if (typeof window === 'undefined') return '';
  let gid = localStorage.getItem(LS_GUEST_ID_KEY);
  if (!gid) {
    gid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    localStorage.setItem(LS_GUEST_ID_KEY, gid);
  }
  return gid;
}

/**
 * Prüft ob der Nutzer bereits zugestimmt hat.
 * Gibt sofort (synchron) true/false aus dem localStorage zurück.
 */
export function hasAcceptedAudioConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LS_CONSENT_KEY) === 'true';
}

/**
 * Speichert die Zustimmung:
 * 1. localStorage setzen
 * 2. Supabase user_consents schreiben (fire-and-forget)
 * 3. GA4 dataLayer-Event feuern
 */
export async function confirmAudioConsent(
  category: AudioCategory,
  contentTitle: string,
  userId: string | null
): Promise<void> {
  if (typeof window === 'undefined') return;

  const guestId   = getOrCreateGuestSessionId();
  const timestamp = new Date().toISOString();

  // 1. Sofort im localStorage speichern
  localStorage.setItem(LS_CONSENT_KEY, 'true');
  // Backward compat mit bestehendem System
  localStorage.setItem('flow_disclaimer_accepted', 'true');

  // 2. Async in Supabase schreiben (fire-and-forget, blockiert UI nicht)
  (async () => {
    try {
      const supabase = getSupabase();
      await supabase.from('user_consents').insert({
        user_id:             userId ?? null,
        guest_session_id:    userId ? null : guestId,
        content_category:    category,
        disclaimer_accepted: true,
        accepted_at:         timestamp,
        user_agent:          typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });
    } catch (e) {
      console.warn('[consentManager] Supabase write failed (non-blocking):', e);
    }
  })();

  // 3. GA4 dataLayer-Event
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event:             'disclaimer_consent_granted',
    guest_id:          guestId,
    content_category:  category,
    content_title:     contentTitle,
    consent_timestamp: timestamp,
  });
}

/**
 * Nach Login: Synct den Gast-Consent (guest_session_id) mit der echten user_id.
 * Wird in AuthContext aufgerufen, sobald ein Nutzer sich einloggt.
 */
export async function syncConsentAfterLogin(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const guestId = localStorage.getItem(LS_GUEST_ID_KEY);
  if (!guestId) return;

  try {
    const supabase = getSupabase();
    await supabase
      .from('user_consents')
      .update({ user_id: userId })
      .eq('guest_session_id', guestId)
      .is('user_id', null);
  } catch (e) {
    console.warn('[consentManager] syncConsentAfterLogin failed:', e);
  }
}
