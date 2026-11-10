/**
 * Audio-Konfiguration für das geschützte Streaming.
 *
 * Basis-URL des Cloudflare Workers, der die Audiodateien nur an berechtigte
 * Nutzer ausliefert. Überschreibbar per Umgebungsvariable VITE_AUDIO_BASE_URL
 * (z. B. später https://audio.flow-der-stille.de).
 */
const DEFAULT_AUDIO_BASE_URL = 'https://fds-audio.dirk-online-services.workers.dev';

export const AUDIO_BASE_URL: string = (
  (import.meta.env.VITE_AUDIO_BASE_URL as string | undefined) || DEFAULT_AUDIO_BASE_URL
).replace(/\/+$/, '');

/**
 * Öffentliche Hörproben (eigens geschnittene Kurzfassungen, frei abspielbar).
 * Vollversionen laufen NIE über diese Adresse, sondern nur über den Worker.
 *
 * ACHTUNG: Die Hörproben liegen derzeit noch im öffentlichen r2.dev-Bereich.
 * Bevor dieser abgeschaltet wird, die Hörproben an einen neuen öffentlichen Ort
 * verschieben und VITE_HOERPROBEN_BASE_URL bzw. produkte.hoerprobe_url anpassen.
 */
export const HOERPROBEN_BASE_URL: string = (
  (import.meta.env.VITE_HOERPROBEN_BASE_URL as string | undefined) ||
  'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerproben'
).replace(/\/+$/, '');

/** Bekannte öffentliche Hörproben je produkte.id (Fallback, falls die DB nicht erreichbar ist). */
export const PUBLIC_HOERPROBEN: Record<string, string> = {
  meditation_zur_herzoeffnung: `${HOERPROBEN_BASE_URL}/Werbung(Hoerprobe)%20Herzoeffnung%20-%20%20Schutzpanzer.mp3`,
  selbsthypnose_besser_und_erholsamer_schlaf: `${HOERPROBEN_BASE_URL}/Werbung(hoerprobe)%20Selbsthypnose%20-%20%20Besser%20Schlafen.mp3`,
};
