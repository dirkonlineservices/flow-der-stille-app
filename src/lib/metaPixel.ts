/**
 * metaPixel.ts – DSGVO-konforme Integration des Meta Pixels (Facebook & Instagram)
 * Pixel-ID: 1065633849494606 (DS Online Services / Flow der Stille)
 *
 * Features:
 * - Strenges Opt-in: Startet NUR nach Nutzerzustimmung (Consent Mode).
 * - Multi-Plattform-Erkennung: Sendet bei JEDEM Event mit, ob es aus der 'app' (Android) oder vom 'web' kam.
 * - UTM- & Facebook-Click-Tracking: Speichert utm_source, utm_campaign und fbclid.
 * - Advanced Matching: Übergibt gehashte Nutzerdaten (E-Mail, Vorname) für 95%+ Kampagnen-Zuordnung.
 */

import { isAnalyticsAllowed } from './tracking';

export const META_PIXEL_IDS = [
  '1065633849494606', // Flow der Stille – Pixel (Business Manager / DS Online Services)
  '1195226879163757'  // Dirk Schmetzer – Pixel (Werbekonto in Anzeige)
];
export const META_PIXEL_ID = META_PIXEL_IDS[0];

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let isInitialized = false;
// Zuletzt gemeldete Adresse: verhindert doppelte PageViews (Pixel-Start + Routen-Tracking für dieselbe Seite)
let lastPageViewPath = '';
const currentPath = () => (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');

/**
 * Ermittelt ob der Nutzer in der nativen Android-App oder im Webbrowser ist
 */
export function getPlatformType(): 'app' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const isNative = Boolean(
    (window as any).Capacitor?.isNativePlatform?.() ||
    typeof (window as any).CdvPurchase !== 'undefined'
  );
  return isNative ? 'app' : 'web';
}

/**
 * Speichert & liest Kampagnen-Parameter (utm_source, utm_campaign, fbclid)
 */
export function captureTrafficSource(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign');
    const utmMedium = params.get('utm_medium');
    const fbclid = params.get('fbclid');

    if (utmSource || fbclid || utmCampaign) {
      const sourceData: Record<string, string> = {
        source: utmSource || (fbclid ? 'facebook' : 'direct'),
        medium: utmMedium || (fbclid ? 'cpc' : 'web'),
        campaign: utmCampaign || '',
        fbclid: fbclid || '',
        captured_at: new Date().toISOString()
      };
      localStorage.setItem('flow_traffic_source', JSON.stringify(sourceData));
      return sourceData;
    }

    const saved = localStorage.getItem('flow_traffic_source');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Initialisiert den Meta Pixel, sobald der Nutzer eingewilligt hat.
 */
export function initMetaPixel(userData?: { email?: string; firstName?: string; lastName?: string }): void {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  if (!isAnalyticsAllowed()) return;

  // Traffic-Parameter aus URL sichern
  captureTrafficSource();

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
    // Advanced Matching Daten vorbereiten falls vorhanden
    const advancedMatching: Record<string, any> = {};
    if (userData?.email) advancedMatching.em = userData.email.trim().toLowerCase();
    if (userData?.firstName) advancedMatching.fn = userData.firstName.trim().toLowerCase();
    if (userData?.lastName) advancedMatching.ln = userData.lastName.trim().toLowerCase();

    META_PIXEL_IDS.forEach((id) => {
      if (Object.keys(advancedMatching).length > 0) {
        window.fbq('init', id, advancedMatching);
      } else {
        window.fbq('init', id);
      }
    });

    const platform = getPlatformType();
    const traffic = captureTrafficSource();

    window.fbq('track', 'PageView', {
      platform,
      traffic_source: traffic.source || 'organic',
      campaign: traffic.campaign || undefined
    });
    lastPageViewPath = currentPath();
    isInitialized = true;
  }
}

/**
 * Übergibt nachträglich Nutzerdaten an Meta (z. B. nach Login/Registrierung) für Advanced Matching
 */
export function setMetaUserProperties(user: { email?: string; firstName?: string; lastName?: string }): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  try {
    const payload: Record<string, any> = {};
    if (user.email) payload.em = user.email.trim().toLowerCase();
    if (user.firstName) payload.fn = user.firstName.trim().toLowerCase();
    if (user.lastName) payload.ln = user.lastName.trim().toLowerCase();
    META_PIXEL_IDS.forEach((id) => {
      try {
        window.fbq('setUserProperties', id, payload);
      } catch {}
    });
  } catch (e) {
    console.warn('Meta setUserProperties notice:', e);
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
    if (currentPath() === lastPageViewPath) return;
    lastPageViewPath = currentPath();
    const platform = getPlatformType();
    const traffic = captureTrafficSource();
    window.fbq('track', 'PageView', {
      platform,
      traffic_source: traffic.source || 'organic',
      campaign: traffic.campaign || undefined
    });
  }
}

/**
 * Event: Registrierung abgeschlossen (mit klarer App- vs. Web-Kennzeichnung)
 */
export function trackMetaRegistration(params?: { method?: string; email?: string; firstName?: string; userId?: string }): boolean {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return false;

  // Pro Konto nur EINMAL melden (E-Mail-Registrierung + spätere Bestätigung, Social Login, Web & App)
  const dedupeKey = params?.userId ? `fds_meta_registration_${params.userId}` : '';
  try {
    if (dedupeKey && localStorage.getItem(dedupeKey)) return false;
  } catch {}

  const platform = getPlatformType();
  const traffic = captureTrafficSource();

  if (params?.email) {
    setMetaUserProperties({ email: params.email, firstName: params.firstName });
  }

  window.fbq('track', 'CompleteRegistration', {
    content_name: params?.method || 'Email',
    status: true,
    platform, // 'app' oder 'web'
    traffic_source: traffic.source || 'direct',
    campaign: traffic.campaign || undefined
  });

  try {
    if (dedupeKey) localStorage.setItem(dedupeKey, new Date().toISOString());
  } catch {}
  return true;
}

/**
 * Event: Kauf gestartet (PayPal-Button bzw. In-App-Kauf angetippt)
 */
export function trackMetaInitiateCheckout(params: { value: number; content_name?: string; content_ids?: string[]; currency?: string }): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  const platform = getPlatformType();
  const traffic = captureTrafficSource();

  window.fbq('track', 'InitiateCheckout', {
    value: params.value,
    currency: params.currency || 'EUR',
    content_name: params.content_name || 'Produktkauf',
    content_ids: params.content_ids || [],
    content_type: 'product',
    num_items: 1,
    platform, // 'app' oder 'web'
    traffic_source: traffic.source || 'direct',
    campaign: traffic.campaign || undefined
  });
}

/**
 * Event: Lead / Newsletter-Eintragung
 */
export function trackMetaLead(category: string = 'Newsletter'): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  const platform = getPlatformType();
  const traffic = captureTrafficSource();

  window.fbq('track', 'Lead', {
    content_name: category,
    content_category: 'Lead',
    platform, // 'app' oder 'web'
    traffic_source: traffic.source || 'direct',
    campaign: traffic.campaign || undefined
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
  platform?: 'app' | 'web';
}): void {
  if (typeof window === 'undefined' || !isInitialized || !window.fbq) return;
  const platform = params.platform || getPlatformType();
  const traffic = captureTrafficSource();

  window.fbq('track', 'Purchase', {
    value: params.value,
    currency: params.currency || 'EUR',
    content_name: params.content_name || 'Produktkauf',
    content_ids: params.content_ids || [],
    content_type: params.content_type || 'product',
    platform, // 'app' oder 'web'
    traffic_source: traffic.source || 'direct',
    campaign: traffic.campaign || undefined
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
  const platform = getPlatformType();
  const traffic = captureTrafficSource();

  window.fbq('track', 'ViewContent', {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_category: params.content_category || 'Meditation & Hörbuch',
    value: params.value || 0,
    currency: params.currency || 'EUR',
    platform, // 'app' oder 'web'
    traffic_source: traffic.source || 'direct'
  });
}
