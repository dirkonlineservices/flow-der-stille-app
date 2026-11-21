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
 * Ausgeliefert über den Worker-Pfad /hoerprobe auf audio.flow-der-stille.de
 * (gleiche Adressen wie in produkte.hoerprobe_url). Der öffentliche r2.dev-Zugang
 * des Buckets fds-audio wird nicht mehr genutzt und kann abgeschaltet werden.
 */
export const HOERPROBEN_BASE_URL: string = (
  (import.meta.env.VITE_HOERPROBEN_BASE_URL as string | undefined) ||
  'https://audio.flow-der-stille.de/hoerprobe'
).replace(/\/+$/, '');

/**
 * Kostenfreie Aufnahmen des Adventskalenders (öffentlicher Bucket fds-public,
 * Ordner adventskalender/, Dateien tag-01.mp3 bis tag-24.mp3).
 */
export const ADVENT_AUDIO_BASE_URL: string = (
  (import.meta.env.VITE_ADVENT_AUDIO_BASE_URL as string | undefined) ||
  'https://pub-96f9d5befdf34ab29400d2486180932e.r2.dev/adventskalender'
).replace(/\/+$/, '');

/** Stream-Adresse der Aufnahme eines Adventskalender-Tages. */
export const getAdventAudioUrl = (day: number): string =>
  `${ADVENT_AUDIO_BASE_URL}/tag-${String(day).padStart(2, '0')}.mp3`;

/** Bekannte öffentliche Hörproben je produkte.id (Fallback, falls die DB nicht erreichbar ist). */
export const PUBLIC_HOERPROBEN: Record<string, string> = {
  meditation_zur_herzoeffnung: `${HOERPROBEN_BASE_URL}/Werbung(Hoerprobe)%20Herzoeffnung%20-%20%20Schutzpanzer.mp3`,
  selbsthypnose_besser_und_erholsamer_schlaf: `${HOERPROBEN_BASE_URL}/Werbung(hoerprobe)%20Selbsthypnose%20-%20%20Besser%20Schlafen.mp3`,
};
