/**
 * offlineAudioService.ts – Sicheres Offline-Caching & Sandbox-Speicherung für Audio-Dateien.
 *
 * Schutz der Inhalte & Flugmodus-Verfügbarkeit:
 * - Verwendet die CacheStorage API & Blobs in der geschützten App-Sandbox.
 * - Dateien landen NICHT in der öffentlichen Musikbibliothek oder im Downloads-Ordner.
 * - Beim Deinstallieren der App werden alle gecachten Daten durch das Betriebssystem gelöscht.
 * - Automatisches Hintergrund-Caching beim Abspielen & manuelles Speichern per Button.
 */

const CACHE_NAME = 'fds-protected-audio-v1';
const METADATA_KEY = 'fds_offline_audio_metadata';

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

export interface OfflineTrackMetadata {
  productId: string;
  title: string;
  url: string;
  sizeBytes: number;
  cachedAt: string;
}

/**
 * Holt alle gespeicherten Metadaten aus dem localStorage
 */
function getMetadataMap(): Record<string, OfflineTrackMetadata> {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Speichert Metadaten im localStorage
 */
function saveMetadataMap(map: Record<string, OfflineTrackMetadata>): void {
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Could not save offline audio metadata:', e);
  }
}

/**
 * Prüft, ob ein bestimmtes Produkt / eine URL offline im Sandbox-Cache liegt.
 */
export async function isOfflineAvailable(productId: string, url?: string): Promise<boolean> {
  if (!productId) return false;
  
  // 1. Metadaten-Check
  const map = getMetadataMap();
  if (map[productId]) return true;

  // 2. Direkter Cache-Check
  if ('caches' in window && url) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      return !!match;
    } catch {
      return false;
    }
  }

  return false;
}

export class StorageQuotaExceededError extends Error {
  constructor(message: string = 'Der App-Speicher für Offline-Audios ist voll. Bitte entferne eine gespeicherte Audio-Datei, um Platz zu schaffen.') {
    super(message);
    this.name = 'StorageQuotaExceededError';
  }
}

/**
 * Lädt eine Audio-Datei im Hintergrund in den geschützten App-Sandbox-Cache.
 */
export async function saveForOffline(
  productId: string,
  url: string,
  title: string = 'Audio',
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!url) throw new Error('Keine gültige Audio-URL übergeben.');

  if (!('caches' in window)) {
    throw new Error('Offline-Cache wird von diesem Gerät/Browser nicht unterstützt.');
  }

  const cache = await caches.open(CACHE_NAME);

  // Prüfen ob bereits vorhanden
  const existing = await cache.match(url);
  if (existing) {
    const blob = await existing.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    // Metadaten aktualisieren falls nötig
    const map = getMetadataMap();
    map[productId] = {
      productId,
      title,
      url,
      sizeBytes: blob.size,
      cachedAt: new Date().toISOString()
    };
    saveMetadataMap(map);

    return blobUrl;
  }

  // 1. Download mit Fetch (für Fortschrittsanzeige)
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`Download fehlgeschlagen mit Status: ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body || total === 0) {
    // Fallback: Response direkt cachen
    try {
      await cache.put(url, response.clone());
    } catch (e: any) {
      if (
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        (e.message && /quota|storage|exceeded|full|space/i.test(e.message))
      ) {
        throw new StorageQuotaExceededError();
      }
      throw e;
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const map = getMetadataMap();
    map[productId] = {
      productId,
      title,
      url,
      sizeBytes: blob.size,
      cachedAt: new Date().toISOString()
    };
    saveMetadataMap(map);
    if (onProgress) onProgress(100);
    return blobUrl;
  }

  // Stream verarbeiten für exakte %-Fortschrittsanzeige
  const reader = response.body.getReader();
  let loaded = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.length;
      if (total > 0 && onProgress) {
        const percent = Math.round((loaded / total) * 100);
        onProgress(percent);
      }
    }
  }

  const blob = new Blob(chunks, { type: response.headers.get('content-type') || 'audio/mpeg' });
  const syntheticResponse = new Response(blob, {
    status: 200,
    statusText: 'OK',
    headers: response.headers
  });

  // Im Sandbox Cache ablegen mit QuotaExceededError-Abfang
  try {
    await cache.put(url, syntheticResponse);
  } catch (e: any) {
    if (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (e.message && /quota|storage|exceeded|full|space/i.test(e.message))
    ) {
      throw new StorageQuotaExceededError();
    }
    throw e;
  }

  // Metadaten registrieren
  const map = getMetadataMap();
  map[productId] = {
    productId,
    title,
    url,
    sizeBytes: blob.size,
    cachedAt: new Date().toISOString()
  };
  saveMetadataMap(map);

  if (onProgress) onProgress(100);
  return URL.createObjectURL(blob);
}

/**
 * Automatisches Caching im Hintergrund beim Abspielen.
 * Läuft stumm ab, ohne das Playback zu blockieren.
 */
export async function cacheAudioInBackground(productId: string, url: string, title?: string): Promise<void> {
  if (!url || !('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    if (!match) {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        await cache.put(url, response.clone());
        const blob = await response.blob();
        const map = getMetadataMap();
        map[productId] = {
          productId,
          title: title || 'Audio',
          url,
          sizeBytes: blob.size,
          cachedAt: new Date().toISOString()
        };
        saveMetadataMap(map);
        console.log(`[OfflineCache] Audio '${title || productId}' im Hintergrund gecached.`);
      }
    }
  } catch (e) {
    console.warn('[OfflineCache] Hintergrund-Caching fehlgeschlagen (evtl. offline):', e);
  }
}

/**
 * Gibt die abspielbare Audio-URL zurück.
 * Wenn die Datei im geschützten Offline-Cache liegt, wird eine Blob-URL zurückgegeben.
 * Falls nicht, wird die Remote-URL geliefert UND im Hintergrund automatisch gecached.
 */
export async function getPlayableAudioUrl(productId: string, remoteUrl: string, title?: string): Promise<string> {
  if (!remoteUrl) return '';

  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(remoteUrl);
      if (match) {
        const blob = await match.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn('[OfflineCache] Cache match fehler:', e);
    }
  }

  // Keinesfalls automatisches Hintergrund-Caching! Der Nutzer entscheidet selbst per "Offline speichern" Button.
  return remoteUrl;
}

/**
 * Löscht eine gecachte Datei aus dem Sandbox-Speicher.
 */
export async function removeOfflineAudio(productId: string, url: string): Promise<void> {
  if ('caches' in window && url) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);
    } catch (e) {
      console.warn('Could not delete from CacheStorage:', e);
    }
  }

  const map = getMetadataMap();
  delete map[productId];
  saveMetadataMap(map);
}

/**
 * Löscht ALLE gecachten Dateien aus dem Sandbox-Speicher.
 */
export async function clearAllOfflineAudio(): Promise<void> {
  if ('caches' in window) {
    try {
      await caches.delete(CACHE_NAME);
    } catch (e) {
      console.warn('Could not delete CacheStorage:', e);
    }
  }
  localStorage.removeItem(METADATA_KEY);
}

/**
 * Gibt alle aktuell offline gespeicherten Tracks als Liste zurück
 */
export function getOfflineTrackList(): OfflineTrackMetadata[] {
  const map = getMetadataMap();
  return Object.values(map);
}

/**
 * Gibt eine Übersicht der gesamten Speicherbelegung zurück.
 */
export function getStorageUsageSummary() {
  const tracks = getOfflineTrackList();
  const totalBytes = tracks.reduce((acc, t) => acc + (t.sizeBytes || 0), 0);
  return {
    totalBytes,
    totalMBFormatted: formatSizeBytes(totalBytes),
    totalTracks: tracks.length,
    tracks
  };
}

/**
 * Formatierte Dateigröße in MB
 */
export function formatSizeBytes(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
