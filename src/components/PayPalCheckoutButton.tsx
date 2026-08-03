import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
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
  if (!produkt || !produkt.id || !produkt.preis) {
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

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState(false);
  const [runtimeClientId, setRuntimeClientId] = useState<string>(
    import.meta.env.VITE_PAYPAL_CLIENT_ID || paypalClientId || "BAAKqq0F1xbok5dmAg0bFJL6dvnPRzq-Pe53JEyL5nZbWvHSg5DZlFZHzwsxJZ2JkS9Q1uKJ4OtVDZsWEk"
  );

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.paypalClientId) {
          setRuntimeClientId(data.paypalClientId);
        }
      })
      .catch(err => {
        console.warn('Could not fetch runtime config:', err);
      });
  }, []);

  const clientId = runtimeClientId.trim();

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

      {error && (
        <p className="text-xs text-[#ef4444] bg-[#fef2f2] p-3 rounded-lg border border-[#fca5a5]">
          Zahlungsdienst temporär nicht verfügbar oder fehlgeschlagen.
        </p>
      )}

      {!clientId && acceptedTerms && (
        <p className="text-xs text-[#ef4444] bg-[#fef2f2] p-3 rounded-lg border border-[#fca5a5]">
          PayPal Client ID ist nicht konfiguriert. Bitte hinterlege VITE_PAYPAL_CLIENT_ID in den AI Studio Secrets.
        </p>
      )}

      {acceptedTerms && clientId && (
        <div className="w-full animate-fade-in transition-all duration-300 relative z-10">
          <PayPalScriptProvider 
            options={{ 
              clientId: clientId,
              currency: "EUR",
              intent: "capture"
            }}
          >
            <PayPalButtons
              style={{ layout: 'vertical', shape: 'pill', label: 'checkout', height: 40 }}
              createOrder={(data, actions) => {
                const safePrice = parseFloat(produkt?.preis || '0').toFixed(2);

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
              }}
              onApprove={async (data, actions) => {
                try {
                  const details = await actions.order!.capture();
                  const amountVal = details?.purchase_units?.[0]?.amount?.value || parseFloat(produkt?.preis || '0').toFixed(2);
                  const priceValue = parseFloat(amountVal);
                  const orderId = details?.id || 'PP_' + Date.now();

                  const supabase = getSupabase();
                  const { data: { session } } = await supabase.auth.getSession();

                  if (!session) throw new Error("Keine aktive Session gefunden.");

                  const { error: insertError } = await supabase.from('kaeufe').insert([{
                    user_id: session.user.id,
                    produkt_id: produkt?.id,
                    paypal_order_id: orderId,
                    preis: priceValue,
                    waehrung: 'EUR',
                    widerruf_verzicht_akzeptiert: true
                  }]);

                  if (insertError) {
                    console.warn('Direct insert into kaeufe warning:', insertError);
                  }

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
              }}
              onCancel={() => {
                if (typeof window !== 'undefined' && (window as any).dataLayer) {
                  (window as any).dataLayer.push({
                    event: 'checkout_abandoned',
                    ecommerce: { items: [{ item_id: produkt?.id }] }
                  });
                }
              }}
              onError={(err) => {
                console.error("PayPal SDK Error:", err);
                setError(true);
                if (typeof window !== 'undefined' && (window as any).dataLayer) {
                  (window as any).dataLayer.push({
                    event: 'checkout_error',
                    error_type: 'paypal_sdk_error',
                    product_id: produkt?.id
                  });
                }
              }}
            />
          </PayPalScriptProvider>
        </div>
      )}
    </div>
  );
};
