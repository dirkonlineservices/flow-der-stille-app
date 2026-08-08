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
  return status === 'accepted' || status === 'all' || status === 'necessary';
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
 * Setzt den Analytics-Einwilligungsstatus (App-Consent)
 */
export const setAnalyticsConsent = (choice: 'accepted' | 'rejected') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    
    pushToDataLayer({
      event: 'consent_update',
      consent_choice: choice,
      analytics_enabled: choice === 'accepted'
    });

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': choice === 'accepted' ? 'granted' : 'denied',
        'ad_storage': choice === 'accepted' ? 'granted' : 'denied',
        'ad_user_data': choice === 'accepted' ? 'granted' : 'denied',
        'ad_personalization': choice === 'accepted' ? 'granted' : 'denied',
      });
    }
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
    ecommerce: {
      transaction_id: transactionId,
      value: value,
      currency: 'EUR'
    },
    user_email: email
  });
};

export const trackAudioComplete = () => {
  pushToDataLayer({
    event: 'audio_complete'
  });
};
