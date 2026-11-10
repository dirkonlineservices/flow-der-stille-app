/**
 * offlineAudioService.ts – Lokaler Kaufstatus-Cache.
 *
 * Audiodateien werden NICHT mehr lokal gespeichert (kein Download, kein Datei-Cache).
 * Alle Vollversionen laufen ausschließlich über das geschützte Streaming (lib/audioStream.ts).
 * Hier bleibt nur der Cache der freigeschalteten Produkt-IDs, damit die Oberfläche
 * auch bei kurzem Verbindungsabbruch den richtigen Status zeigt.
 */

const LEGACY_CACHE_NAME = 'fds-protected-audio-v1';
const LEGACY_METADATA_KEY = 'fds_offline_audio_metadata';

// ─── Offline-Kaufstatus-Manager ────────────────────────────────────────────────
// Speichert freigeschaltete Produkt-IDs lokal, damit der Player auch im
// Flugmodus (ohne Supabase-Verbindung) korrekt gerendert wird.
const OFFLINE_PURCHASES_KEY = 'flow_offline_purchases';

export const offlineManager = {
  /**
   * Speichert eine Liste freigeschalteter Produkt-IDs lokal.
   * Wird nach erfolgreichem Online-Login / erfolgreicher Kaufprüfung aufgerufen.
   */
  savePurchasedProducts(productIds: string[]): void {
    try {
      const existing = this.getPurchasedProducts();
      const merged = Array.from(new Set([...existing, ...productIds]));
      localStorage.setItem(OFFLINE_PURCHASES_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('[offlineManager] Could not save offline purchases:', e);
    }
  },

  /**
   * Prüft, ob ein Produkt als gekauft im lokalen Cache liegt.
   * Erlaubt Freischaltung des Players auch ohne Netzwerkverbindung.
   */
  isPurchasedOffline(productId: string): boolean {
    try {
      const ids = this.getPurchasedProducts();
      return ids.some((id) => id === productId || productId.includes(id) || id.includes(productId));
    } catch {
      return false;
    }
  },

  /**
   * Gibt alle lokal gespeicherten Produkt-IDs zurück.
   */
  getPurchasedProducts(): string[] {
    try {
      const raw = localStorage.getItem(OFFLINE_PURCHASES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Löscht den lokalen Kaufstatus-Cache (z. B. beim Logout).
   */
  clearPurchasedProducts(): void {
    try {
      localStorage.removeItem(OFFLINE_PURCHASES_KEY);
    } catch (e) {
      console.warn('[offlineManager] Could not clear offline purchases:', e);
    }
  }
};

/**
 * Entfernt Audiodateien, die frühere App-Versionen offline gespeichert haben.
 * Wird beim App-Start einmal aufgerufen.
 */
export async function purgeLegacyOfflineAudio(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      await caches.delete(LEGACY_CACHE_NAME);
    }
    localStorage.removeItem(LEGACY_METADATA_KEY);
  } catch {
    /* ignorieren */
  }
}
