import React, { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';

interface PayPalCheckoutButtonProps {
  produkt: any;
  user: any;
  setShowUnlockBanner: (show: boolean) => void;
  onSuccess: () => void;
  paypalClientId: string;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  produkt,
  user,
  setShowUnlockBanner,
  onSuccess,
  paypalClientId,
}) => {
  // UX/Tracking: Guardrail für korrupte Produktdaten
  if (!produkt || !produkt.id || !produkt.preis) {
    // Tracking-Event für GA4 / Looker Studio
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'system_error',
        error_type: 'missing_product_data_for_checkout',
        component: 'PayPalCheckoutButton'
      });
    }

    return (
      <div className="w-full p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)]">
        <p className="text-sm text-[var(--text-muted)] text-center">
          Produktdaten konnten nicht vollständig geladen werden. Bitte lade die Seite neu.
        </p>
      </div>
    );
  }

  const [isSdkReady, setIsSdkReady] = useState(false);
  const [error, setError] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [missingIdError, setMissingIdError] = useState(false);
  
  // 1. Enterprise Fix: Direkte DOM-Referenz statt string-IDs
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // 2. PayPal SDK laden
  useEffect(() => {
    if (!paypalClientId || paypalClientId.trim() === '' || paypalClientId === 'undefined') {
      setMissingIdError(true);
      return;
    }

    if ((window as any).paypal) {
      setIsSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-js-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId.trim()}&currency=EUR&intent=capture`;
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    script.onerror = () => setError(true);
    document.body.appendChild(script);
  }, [paypalClientId]);

  // 3. PayPal Button erst rendern, wenn AGB akzeptiert und SDK ready
  useEffect(() => {
    if (!isSdkReady || !(window as any).paypal || !acceptedTerms || !paypalContainerRef.current) return;
    
    // Verhindert doppeltes Rendern im React Strict Mode
    if (paypalContainerRef.current.innerHTML !== '') return;

    (window as any).paypal.Buttons({
      style: { layout: 'vertical', shape: 'pill', label: 'checkout', height: 40 },
      createOrder: (data: any, actions: any) => {
        const safePrice = parseFloat(produkt?.preis || '0').toFixed(2); 

        // Tracking: Checkout Beginn erst hier erfassen! (Sauberer Funnel)
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({ ecommerce: null });
          (window as any).dataLayer.push({
            event: 'begin_checkout',
            ecommerce: {
              currency: 'EUR',
              value: safePrice,
              items: [{
                item_id: produkt?.id || 'unknown',
                item_name: produkt?.titel || 'Flow der Stille Premium',
                price: safePrice,
                quantity: 1
              }]
            }
          });
        }

        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: { 
              value: safePrice, 
              currency_code: 'EUR' 
            },
            description: produkt?.titel || 'Flow der Stille Premium',
          }],
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const details = await actions.order.capture();
          const amountVal = details?.purchase_units?.[0]?.amount?.value || parseFloat(produkt?.preis || '0').toFixed(2);
          const priceValue = parseFloat(amountVal);
          const orderId = details?.id || 'PP_' + Date.now();

          const supabase = getSupabase();
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) throw new Error("Keine aktive Session gefunden.");

          const { error: fnError } = await supabase.functions.invoke('process-purchase', {
            body: {
              transaction_id: orderId,
              product_id: produkt?.id, 
              product_name: produkt?.titel,
              price: priceValue
            },
            headers: { Authorization: `Bearer ${session.access_token}` }
          });

          if (fnError) throw fnError;

          // Tracking: Erfolgreicher Kauf
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            const dl = (window as any).dataLayer;
            dl.push({ ecommerce: null }); 
            dl.push({
              event: 'purchase',
              ecommerce: {
                transaction_id: orderId,
                value: priceValue,
                currency: 'EUR',
                payment_method: 'paypal',
                items: [{ item_id: produkt?.id, item_name: produkt?.titel, price: produkt?.preis }], 
              },
            });
          }

          setShowUnlockBanner(true);
          setTimeout(() => {
            onSuccess();
            setShowUnlockBanner(false);
          }, 2000);

        } catch (err) {
          console.error("Transaktionsfehler:", err);
          setError(true);
        }
      },
      onCancel: () => {
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'checkout_abandoned',
            ecommerce: { items: [{ item_id: produkt?.id }] }
          });
        }
      },
      onError: (err: any) => {
        console.error("PayPal SDK Error:", err);
        setError(true);
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'checkout_error',
            error_type: 'paypal_sdk_error',
            product_id: produkt?.id
          });
        }
      },
    }).render(paypalContainerRef.current); 
    
  }, [isSdkReady, produkt, acceptedTerms]); // Trigger erst auslösen, wenn Häkchen gesetzt wird

  if (missingIdError || error)
    return <p className="text-xs text-[#ef4444] bg-[#fef2f2] p-3 rounded-lg border border-[#fca5a5]">Zahlungsdienst temporär nicht verfügbar.</p>;
  
  if (!isSdkReady) 
    return <p className="text-xs text-[var(--text-muted)] animate-pulse">Checkout wird geladen...</p>;

  return (
    <div className="w-full flex flex-col gap-4 mt-4 lg:mt-2">
      
      <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors border ${acceptedTerms ? 'bg-[var(--bg-main)] border-[var(--accent)]' : 'bg-[var(--bg-alt)] border-[var(--border)] hover:bg-[var(--bg-main)]'}`}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 w-5 h-5 accent-[var(--accent)] cursor-pointer shrink-0"
        />
        <span className="flex-1 text-sm text-[var(--text-muted)] leading-relaxed">
          Ich stimme ausdrücklich zu, dass mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist begonnen wird. <strong>Mir ist bekannt, dass ich dadurch mein Widerrufsrecht verliere.</strong>
        </span>
      </label>

      {!acceptedTerms && (
        <div className="w-full p-4 text-center rounded-xl bg-[var(--bg-alt)] border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Bitte bestätige die Bedingungen, um die Zahlungsmöglichkeiten freizuschalten.
          </p>
        </div>
      )}

      {/* UX Fix: Button Container wird erst im DOM gemountet, wenn acceptedTerms true ist. */}
      {/* Dadurch verhindern wir Null-Referenz und Dimension-Fehler des PayPal iframes */}
      {acceptedTerms && (
        <div className="w-full animate-fade-in transition-all duration-300">
          <div ref={paypalContainerRef} className="min-h-[40px] w-full relative z-10"></div>
        </div>
      )}
      
    </div>
  );
};