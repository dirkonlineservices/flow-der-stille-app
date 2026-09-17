/**
 * metaPixel.ts – DSGVO-konforme Integration des Meta Pixels (Facebook Pixel)
 * Pixel-ID: 1065633849494606 (DS Online Services / Flow der Stille)
 *
 * Regeln:
 * - Startet NUR wenn der Nutzer im Cookie-Banner zugestimmt hat (Consent Mode).
 * - Verhindert Datenweitergabe ohne Einwilligung.
 * - Bietet typsichere Tracking-Methoden für PageView, Lead, CompleteRegistration, Purchase & ViewContent.
 */

import { isAnalyticsAllowed } from './tracking';

export const META_PIXEL_ID = '1065633849494606';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let isInitialized = false;

/**
 * Initialisiert den Meta Pixel, sobald der Nutzer eingewilligt hat.
 */
export function initMetaPixel(): void {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  if (!isAnalyticsAllowed()) return;

  // Standard Meta Pixel Script Injection
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  if (window.fbq) {
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    isInitialized = true;
  }
}

/**
 * Sendet ein PageView-Event bei Routenwechseln in der Single Page App
 */
export function trackMetaPageView(): void {
  if (typeof window === 'undefined') return;
  if (!isInitialized) {
    if (isAnalyticsAllowed()) {
      initMetaPixel();
    }
    return;
  }
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
}

/**
 * Event: Registrierung abgeschlossen
 */
export function trackMetaRegistration(method: string = 'Email'): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  window.fbq('track', 'CompleteRegistration', {
    content_name: method,
    status: true
  });
}

/**
 * Event: Lead / Newsletter-Eintragung
 */
export function trackMetaLead(category: string = 'Newsletter'): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  window.fbq('track', 'Lead', {
    content_name: category,
    content_category: 'Lead'
  });
}

/**
 * Event: Kaufabschluss (Hörbuch / Meditation / Paket)
 */
export function trackMetaPurchase(params: {
  value: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
}): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  window.fbq('track', 'Purchase', {
    value: params.value,
    currency: params.currency || 'EUR',
    content_name: params.content_name || 'Produktkauf',
    content_ids: params.content_ids || [],
    content_type: params.content_type || 'product'
  });
}

/**
 * Event: Produkt / Detailseite aufgerufen
 */
export function trackMetaViewContent(params: {
  content_name: string;
  content_ids?: string[];
  content_category?: string;
  value?: number;
  currency?: string;
}): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  window.fbq('track', 'ViewContent', {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_category: params.content_category || 'Meditation & Hörbuch',
    value: params.value || 0,
    currency: params.currency || 'EUR'
  });
}
