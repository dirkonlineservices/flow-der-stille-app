import React, { useState } from 'react';

// 📊 Typsicherer DataLayer-Helper für sauberes GA4/GTM-Tracking
const pushToDataLayer = (eventName: string, payload: any = {}) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event: eventName, ...payload });
  }
};

interface GooglePlayPaywallProps {
  productId: string;     // Exakt: 'herzoeffnung_meditation'
  price: number;         // 1.49
  title: string;
  onSuccess: () => void; // Callback nach erfolgreichem Kauf & Datenbank-Sync
}

export const GooglePlayPaywall: React.FC<GooglePlayPaywallProps> = ({
  productId,
  price,
  title,
  onSuccess
}) => {
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setConsentGiven(checked);

    if (checked) {
      pushToDataLayer('legal_consent_given', {
        item_id: productId,
        item_name: title
      });
    }
  };

  const handleGooglePlayPurchase = async () => {
    if (!consentGiven || isProcessing) return;
    
    setIsProcessing(true);
    setErrorMsg(null);

    // 📊 Trichter-Start: Intent to buy
    pushToDataLayer('begin_checkout', {
      ecommerce: {
        currency: 'EUR',
        value: price,
        items: [{
          item_id: productId,
          item_name: title,
          item_category: 'Meditation',
          price: price,
          quantity: 1
        }]
      }
    });

    try {
      console.log(`Initiiere nativen Google Play Kauf für ID: ${productId}`);
      
      /* 
        🔌 HIER KOMMT DER NATIVE CAPACITOR CALL HIN:
        const purchase = await CapacitorInAppPurchase.purchase({ id: productId });
      */
      
      // Simulierter API-Call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const purchaseSuccess = true; 

      if (purchaseSuccess) {
        // 📊 Conversion: Kauf erfolgreich abgeschlossen
        pushToDataLayer('purchase', {
          ecommerce: {
            transaction_id: `gplay_${Date.now()}`,
            value: price,
            currency: 'EUR',
            items: [{
              item_id: productId,
              item_name: title,
              price: price,
              quantity: 1
            }]
          }
        });
        
        onSuccess();
      } else {
        throw new Error("Transaktion von Google Play abgelehnt.");
      }
    } catch (error: any) {
      console.error('Google Play Checkout Error:', error);
      setErrorMsg(error.message || "Es gab ein Problem bei der Verarbeitung.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isButtonDisabled = !consentGiven || isProcessing;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      padding: '24px',
      borderRadius: '16px',
      maxWidth: '400px',
      margin: '0 auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '8px', fontSize: '1.25rem' }}>
        {title} freischalten
      </h3>
      <p style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>
        {price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
          Einmalig
        </span>
      </p>

      {/* Error State UI */}
      {errorMsg && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '20px',
          fontWeight: 500
        }}>
          {errorMsg}
        </div>
      )}

      {/* Rechtlicher Zustimmungs-Block */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'flex-start',
        marginBottom: '24px',
        textAlign: 'left'
      }}>
        <input 
          type="checkbox" 
          id={`legal-consent-${productId}`}
          checked={consentGiven}
          onChange={handleConsentChange}
          style={{ 
            marginTop: '3px',
            width: '18px',
            height: '18px',
            accentColor: 'var(--accent)',
            cursor: 'pointer',
            flexShrink: 0
          }} 
        />
        <label htmlFor={`legal-consent-${productId}`} style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)',
          lineHeight: '1.5',
          cursor: 'pointer'
        }}>
          Ich stimme der Ausführung des Vertrages vor Ablauf der Widerrufsfrist ausdrücklich zu. Ich nehme zur Kenntnis, dass mein Widerrufsrecht mit Beginn der Ausführung des digitalen Inhalts erlischt.
        </label>
      </div>

      {/* Dynamischer Kauf-Button */}
      <button
        onClick={handleGooglePlayPurchase}
        disabled={isButtonDisabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: isButtonDisabled ? 'var(--border)' : 'var(--accent)',
          color: isButtonDisabled ? 'var(--text-muted)' : '#ffffff', // Festes Weiß für perfekten Kontrast auf --accent
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          border: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isButtonDisabled ? 0.7 : 1
        }}
      >
        {isProcessing ? (
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        )}
        {isProcessing ? 'Sichere Verbindung...' : 'Kostenpflichtig freischalten'}
      </button>
      
      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Sichere Abwicklung über dein Google Play Konto
      </div>
    </div>
  );
};