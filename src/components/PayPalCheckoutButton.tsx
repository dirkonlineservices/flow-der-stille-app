import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HelpCircle, X, CreditCard, Users, Building2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { getSupabase } from '../lib/supabaseClient';
import { transactionLogger } from '../lib/transactionLogger';
import { reportCriticalError } from '../lib/errorLogger';
import { PurchaseToast, PurchaseToastData } from './PurchaseToast';

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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toast, setToast] = useState<PurchaseToastData>({
    show: false,
    type: 'cancelled',
    title: '',
    message: ''
  });
  const isNativeApp = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());

  const [runtimeClientId, setRuntimeClientId] = useState<string>(
    import.meta.env.VITE_PAYPAL_CLIENT_ID || paypalClientId || "BAAKqq0F1xbok5dmAg0bFJL6dvnPRzq-Pe53JEyL5nZbWvHSg5DZlFZHzwsxJZ2JkS9Q1uKJ4OtVDZsWEk"
  );

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (!res.ok) return;
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return;
        const data = await res.json();
        if (data && data.paypalClientId) {
          setRuntimeClientId(data.paypalClientId);
        }
      } catch {
        // Safe fallback to env or default clientId
      }
    };

    fetchConfig();
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
            key={clientId}
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
                  const currentUserId = session?.user?.id || user?.id;

                  let edgeFunctionSuccess = false;
                  let isAlreadyCompleted = false;

                  // 1. Invoke Supabase Edge Function process-purchase (updates DB, profile, and sends Resend confirmation email)
                  // Die Edge Function ist die primäre Source of Truth für den Datenbankeintrag.
                  try {
                    const fnRes = await supabase.functions.invoke('process-purchase', {
                      body: {
                        transaction_id: orderId,
                        product_id: produkt?.id || 'atemarbeit_herzoeffnung',
                        product_name: produkt?.titel || 'Flow der Stille Premium',
                        price: priceValue
                      }
                    });
                    if (fnRes.error) {
                      transactionLogger.logWarning(
                        'Edge Function Warning',
                        'Supabase Edge Function process-purchase returned an error.',
                        'edge_function',
                        fnRes.error
                      );
                    } else {
                      edgeFunctionSuccess = true;
                      transactionLogger.logSuccess(
                        'Purchase Processed',
                        `Confirmation processed for order ${orderId}`,
                        'edge_function',
                        fnRes.data
                      );
                    }
                  } catch (fnErr) {
                    transactionLogger.logError(
                      'Edge Function Failure',
                      fnErr,
                      'edge_function',
                      { orderId, produktId: produkt?.id }
                    );
                  }

                  // 2. Fallback per Upsert:
                  // Wenn die Edge Function den Kauf erfolgreich verarbeitet hat, startet das Frontend KEINEN eigenen DB-Schreibaufruf mehr.
                  // Falls die Edge Function fehlschlägt (!edgeFunctionSuccess), schreibt das Frontend per .upsert() als Fallback in die Datenbank.
                  if (!edgeFunctionSuccess) {
                    if (currentUserId) {
                      // Idempotenz-Sperre: Prüfe vorab, ob die Bestellung bereits als 'completed' verarbeitet war
                      const { data: existingKauf } = await supabase
                        .from('kaeufe')
                        .select('status')
                        .eq('order_id', orderId)
                        .maybeSingle();

                      if (existingKauf && existingKauf.status === 'completed') {
                        isAlreadyCompleted = true;
                      }

                      const { error: upsertError } = await supabase
                        .from('kaeufe')
                        .upsert(
                          {
                            user_id: currentUserId,
                            produkt_id: produkt?.id,
                            order_id: orderId,
                            preis: priceValue,
                            waehrung: 'EUR'
                          },
                          { onConflict: 'user_id,produkt_id' }
                        );

                      if (upsertError) {
                        transactionLogger.logError(
                          'Database Upsert Failure',
                          upsertError,
                          'supabase_db',
                          { user_id: currentUserId, produkt_id: produkt?.id, order_id: orderId }
                        );
                      } else {
                        transactionLogger.logSuccess(
                          'Purchase Saved to DB (Fallback Upsert)',
                          `Kauf erfolgreich per Fallback-Upsert in 'kaeufe' gespeichert für User ${currentUserId}`,
                          'supabase_db',
                          { orderId, priceValue }
                        );
                      }
                    } else {
                      transactionLogger.logWarning(
                        'No User ID for DB Insert',
                        'Keine User-ID vorhanden für kaeufe-Eintrag. Bitte in der App anmelden.',
                        'auth',
                        { orderId }
                      );
                    }
                  }

                  // DataLayer Purchase Tracking nur ausführen, wenn die Bestellung nicht bereits verarbeitet war
                  if (isAlreadyCompleted) {
                    console.log(`[IDEMPOTENCY] Order ${orderId} war bereits 'completed'. DataLayer-Event wird übersprungen.`);
                  } else if (typeof window !== 'undefined' && (window as any).dataLayer) {
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
                  await reportCriticalError({
                    context: 'Checkout Kaufabwicklung',
                    error: err,
                    userEmail: user?.email
                  });
                  transactionLogger.logError(
                    'Transaktionsfehler',
                    err,
                    'paypal',
                    { product_id: produkt?.id }
                  );
                  setError(true);
                }
              }}
              onCancel={() => {
                setToast({
                  show: true,
                  type: 'cancelled',
                  title: 'PayPal-Kauf abgebrochen',
                  productTitle: produkt?.titel,
                  message: 'Du hast den Bezahlvorgang im PayPal-Fenster abgebrochen. Es wurde kein Betrag von deinem Konto abgebucht.'
                });
                transactionLogger.logWarning(
                  'Kauf abgebrochen',
                  'Der Bezahlvorgang wurde vom Nutzer abgebrochen.',
                  'paypal'
                );
                if (typeof window !== 'undefined' && (window as any).dataLayer) {
                  (window as any).dataLayer.push({
                    event: 'checkout_abandoned',
                    ecommerce: { items: [{ item_id: produkt?.id }] }
                  });
                }
              }}
              onError={async (err) => {
                setToast({
                  show: true,
                  type: 'failed',
                  title: 'PayPal-Zahlung fehlgeschlagen',
                  productTitle: produkt?.titel,
                  message: 'Der Bezahlvorgang mit PayPal konnte nicht abgeschlossen werden. Es wurde kein Geld abgebucht. Du kannst es gleich erneut versuchen.',
                  showSupportLink: true
                });
                await reportCriticalError({
                  context: 'PayPal SDK Fehler',
                  error: err,
                  userEmail: user?.email
                });
                transactionLogger.logError(
                  'PayPal SDK Fehler',
                  err,
                  'paypal',
                  { product_id: produkt?.id }
                );
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

      {/* Floating Purchase Toast Notification */}
      <PurchaseToast 
        toast={toast} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))} 
      />

      {/* PayPal Hilfe-Button / Infobox (nur auf Web, nicht in nativer App) */}
      {!isNativeApp && acceptedTerms && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-full p-3 bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] border border-[var(--accent)]/30 hover:border-[var(--accent)]/60 rounded-xl transition-all cursor-pointer group flex items-center justify-between gap-3 text-left shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shrink-0 group-hover:scale-105 transition-transform">
                <HelpCircle size={18} />
              </div>
              <div>
                <span className="block text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                  Kein PayPal-Konto oder Fragen zur Zahlung?
                </span>
                <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">
                  Zahlung auch per Kreditkarte, Debitkarte oder IBAN ohne Registrierung
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-[var(--accent)] underline-offset-2 group-hover:underline shrink-0 flex items-center gap-1">
              Infos &amp; Hilfe
            </span>
          </button>
        </div>
      )}

      {/* PayPal Hilfe-Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            onClick={() => setShowHelpModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4 border-b border-[var(--border)] flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif font-semibold text-lg text-[var(--text-main)] leading-snug">
                    Flexible Zahlung per PayPal – Auch ohne Konto
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Du hast mehrere bequeme Zahlungsoptionen zur Auswahl.
                  </p>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  aria-label="Hilfe schließen"
                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer shrink-0 mt-0.5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4">

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)]">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 mt-0.5">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--text-main)] mb-0.5">Kein PayPal-Konto nötig</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Du benötigst kein eigenes PayPal-Konto, um zu bezahlen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)]">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 shrink-0 mt-0.5">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--text-main)] mb-0.5">Gastzahlung mit Kreditkarte</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Klicke im geöffneten PayPal-Fenster einfach auf <strong className="text-[var(--text-main)]">&ldquo;Mit Kredit- oder Debitkarte zahlen&rdquo;</strong> oder <strong className="text-[var(--text-main)]">&ldquo;Als Gast bezahlen&rdquo;</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)]">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 shrink-0 mt-0.5">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--text-main)] mb-0.5">Zahlung per Bankeinzug / IBAN</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Du kannst deine normale Bankkarte (Girocard/Debitkarte) oder deine IBAN nutzen, um bequem per Lastschrift zu bezahlen.
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  Verstanden
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
