declare global {
  interface Window {
    dataLayer: any[];
  }
}

// 1. Core-Funktion: Sichert ab, dass der Code nicht beim Server-Side-Rendering crasht.
export const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
};

// 2. Consent Update (Wird vom GTM / Banner gefeuert)
export const trackConsentUpdate = (choice: 'all' | 'necessary' | 'rejected') => {
  pushToDataLayer({
    event: 'consent_update',
    consent_choice: choice
  });
};

export const openCookieConsentModal = () => {
  pushToDataLayer({
    event: 'open_cookie_settings'
  });
};

// 3. Lead Generierung (z.B. nach erfolgreichem Absenden des Kontaktformulars)
export const trackLead = (email: string) => {
  pushToDataLayer({
    event: 'generate_lead',
    user_email: email
  });
};

// 4. Kaufabschluss (z.B. nach erfolgreichem PayPal/Stripe Redirect)
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

// 5. Audio-Interaktion (z.B. wenn der onEnded-Event des Audio-Players triggert)
export const trackAudioComplete = () => {
  pushToDataLayer({
    event: 'audio_complete'
  });
};
