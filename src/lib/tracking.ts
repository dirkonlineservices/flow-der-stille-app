declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const CONSENT_STORAGE_KEY = 'flow_analytics_consent';

/**
 * Prüft, ob Analytics/Tracking vom Nutzer explizit zugelassen wurde.
 * Standardmäßig (wenn noch keine Entscheidung getroffen wurde oder abgelehnt wurde) -> FALSE!
 */
export const isAnalyticsAllowed = (): boolean => {
  if (typeof window === 'undefined') return false;
  const status = localStorage.getItem(CONSENT_STORAGE_KEY);
  const cookieStatus = localStorage.getItem('flow_cookie_consent_status');
  return status === 'accepted' || cookieStatus === 'all' || cookieStatus === 'accepted';
};

/**
 * 1. Core-Funktion: Sendet Events nur, wenn Analytics explizit erlaubt wurde!
 */
export const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    
    // Wenn Consent gegeben wurde oder es ein Consent-Update Event selbst ist:
    if (data.event === 'consent_update' || isAnalyticsAllowed()) {
      window.dataLayer.push(data);
    }
  }
};

/**
 * Hilfsfunktion: Stellt sicher, dass window.gtag existiert und direkt auf window.dataLayer pusht
 */
const getGtagFn = () => {
  if (typeof window === 'undefined') return () => {};
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }
  return window.gtag;
};

/**
 * Setzt den Analytics-Einwilligungsstatus (App- & Web-Consent)
 */
export const setAnalyticsConsent = (choice: 'accepted' | 'rejected') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    
    const gtagFn = getGtagFn();

    // Korrekter Google Consent Mode v2 Update-Aufruf
    gtagFn('consent', 'update', {
      'analytics_storage': choice === 'accepted' ? 'granted' : 'denied',
      'ad_storage': choice === 'accepted' ? 'granted' : 'denied',
      'ad_user_data': choice === 'accepted' ? 'granted' : 'denied',
      'ad_personalization': choice === 'accepted' ? 'granted' : 'denied'
    });

    pushToDataLayer({
      event: 'consent_update',
      consent_choice: choice,
      analytics_enabled: choice === 'accepted'
    });
  }
};

/**
 * Initialisiert den Consent-Status beim Laden der Seite, falls bereits zugestimmt wurde
 */
export const initConsentState = () => {
  if (typeof window === 'undefined') return;
  const status = localStorage.getItem(CONSENT_STORAGE_KEY);
  const cookieStatus = localStorage.getItem('flow_cookie_consent_status');
  const isAccepted = status === 'accepted' || cookieStatus === 'all' || cookieStatus === 'accepted';

  const gtagFn = getGtagFn();
  if (isAccepted) {
    gtagFn('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
  } else if (status === 'rejected' || cookieStatus === 'necessary' || cookieStatus === 'rejected') {
    gtagFn('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }
};

export const trackConsentUpdate = (choice: 'accepted' | 'rejected') => {
  setAnalyticsConsent(choice);
};

export const openCookieConsentModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-banner'));
  }
};

export const trackLead = (email: string) => {
  pushToDataLayer({
    event: 'generate_lead',
    user_email: email
  });
};

export const trackPurchase = (transactionId: string, value: number, email: string) => {
  pushToDataLayer({
    event: 'purchase',
    transaction_id: transactionId,
    value: value,
    user_email: email,
    ecommerce: {
      transaction_id: transactionId,
      value: value,
      currency: 'EUR'
    }
  });
};

export const trackAudioComplete = () => {
  pushToDataLayer({
    event: 'audio_complete'
  });
};
