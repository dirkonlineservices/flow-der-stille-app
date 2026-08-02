import React, { useEffect, useState } from 'react';
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
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [error, setError] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [missingIdError, setMissingIdError] = useState(false);

  useEffect(() => {
    // 📊 GA4 Tracking: Begin Checkout
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'begin_checkout',
        ecommerce: { items: [{ item_id: produkt.id, item_name: produkt.titel, price: produkt.preis }] },
      });
    }

    console.log('DEBUG: PayPal Client ID being used:', paypalClientId);
    if (!paypalClientId || paypalClientId.trim() === '' || paypalClientId === 'undefined') {
      console.error('DEBUG: Invalid PayPal Client ID:', paypalClientId);
      setMissingIdError(true);
      return;
    }

    if ((window as any).paypal) {
      setIsSdkReady(true);
      return;
    }

    // Remove existing script if it exists to avoid conflicts
    const existingScript = document.getElementById('paypal-js-sdk');
    if (existingScript) {
        existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'paypal-js-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId.trim()}&currency=EUR&intent=capture`;
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    script.onerror = () => setError(true);
    document.body.appendChild(script);
  }, [paypalClientId, produkt.id, produkt.titel, produkt.preis]);

  useEffect(() => {
    if (isSdkReady && (window as any).paypal && acceptedTerms && !isRendering) {
      setIsRendering(true);
      const paypal = (window as any).paypal;
      const containerId = `#paypal-btn-${produkt.id}`;
      const container = document.querySelector(containerId);
      if (container) container.innerHTML = '';

      paypal.Buttons({
        style: { layout: 'vertical', shape: 'pill', label: 'checkout', height: 40 },
        createOrder: (data: any, actions: any) => {
          try {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  amount: { value: (produkt.preis ?? '0.00').toString(), currency_code: 'EUR' },
                  description: produkt.titel || 'Produkt',
                },
              ],
            });
          } catch (err) {
            console.error('PayPal createOrder error:', err);
            setError(true);
            throw err;
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            if (actions.order && user) {
              const details = await actions.order.capture();
              const amountVal = details?.purchase_units?.[0]?.amount?.value || produkt.preis || '0.00';
              const priceValue = parseFloat(amountVal);
              const orderId = details?.id || 'PP_' + Date.now();

              // 📊 GA4 Tracking: Purchase
              if (typeof window !== 'undefined' && (window as any).dataLayer) {
                (window as any).dataLayer.push({
                  event: 'purchase',
                  ecommerce: {
                    transaction_id: orderId,
                    value: priceValue,
                    currency: 'EUR',
                    payment_method: 'paypal',
                    items: [{ item_id: produkt.id, item_name: produkt.titel, price: produkt.preis }],
                  },
                });
              }

              const supabase = getSupabase();
              const { error: dbError } = await supabase.from('kaeufe').insert([
                {
                  user_id: user.id,
                  produkt_id: produkt.id,
                  paypal_order_id: orderId,
                  preis: priceValue,
                  waehrung: 'EUR',
                  widerruf_verzicht_akzeptiert: true,
                },
              ]);

              if (dbError) {
                console.error('Supabase insert error in PayPal onApprove:', dbError);
                setError(true);
                return;
              }

              setShowUnlockBanner(true);
              setTimeout(() => {
                onSuccess();
                setShowUnlockBanner(false);
              }, 2000);
            }
          } catch (err) {
            console.error('PayPal onApprove error:', err);
            setError(true);
          }
        },
        onError: (err: any) => {
          console.error('PayPal SDK error:', err);
          setError(true);
        },
      }).render(containerId);
    }
  }, [isSdkReady, acceptedTerms, produkt, user, setShowUnlockBanner, onSuccess, isRendering]);

  if (missingIdError || error)
    return <p className="text-xs text-[#ef4444] bg-[#fef2f2] p-2 rounded-lg">Zahlungsdienst temporär nicht verfügbar.</p>;
  if (!isSdkReady) return <p className="text-xs text-[var(--text-muted)] animate-pulse">PayPal wird geladen...</p>;

  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="flex items-start gap-2 text-[0.72rem] leading-[1.3] text-[var(--text-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 accent-[var(--accent)]"
          />
          <span className="leading-[1.3]">Ich stimme ausdrücklich zu, dass mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist begonnen wird.</span>
        </label>
      </div>
      <div className={`transition-opacity duration-200 ${acceptedTerms ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div id={`paypal-btn-${produkt.id}`}></div>
      </div>
    </div>
  );
};
