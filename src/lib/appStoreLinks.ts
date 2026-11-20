/**
 * appStoreLinks.ts – Central store URLs and badges for the native apps (iOS + Android).
 * Single source of truth for all download links on the website.
 */

export const APP_STORE_ID = '6821544372';
export const APP_STORE_URL = 'https://apps.apple.com/de/app/flow-der-stille-entspannung/id6821544372';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.flowderstille.de';

// Store badges (App Store badge is hosted locally, Google Play badge from Google)
export const APP_STORE_BADGE_URL = '/badges/app-store-badge-de.svg';
export const PLAY_STORE_BADGE_URL =
  'https://play.google.com/intl/en_us/badges/static/images/badges/de_badge_web_generic.png';

export type MobilePlatform = 'ios' | 'android' | 'other';

/** Detects the visitor's mobile platform from the user agent (web only). */
export function detectMobilePlatform(): MobilePlatform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  // iPadOS 13+ reports itself as Macintosh, touch points reveal it
  const isIPadOS = /Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

/** Store URL that fits the visitor's device (iOS → App Store, otherwise Google Play). */
export function getStoreUrlForDevice(): string {
  return detectMobilePlatform() === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
}

export function trackAppDownloadClick(source: string, store: 'app_store' | 'google_play_store') {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event: 'app_download_click', source, destination: store });
  }
}
