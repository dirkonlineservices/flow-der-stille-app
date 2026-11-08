/**
 * NewContentNotification.tsx – Automatischer Hinweis bei neuen Produkten & App-Updates.
 *
 * Liest das neueste Produkt aus Supabase (sortiert nach `created_at`).
 * Wenn der Erstellungs-Zeitpunkt neuer ist als der in `localStorage` gespeicherte Stand,
 * wird ein elegantes Pop-up / Toast (unten rechts auf der Webversion, schlanker Hinweis in der App) angezeigt.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowRight, Download, Headphones, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import { BillingService } from '../lib/billing';
import { hasResolvedCookieConsent } from '../lib/tracking';

const LOCAL_STORAGE_KEY = 'flow_last_seen_product_id';
const LOCAL_STORAGE_UPDATE_DISMISSED_KEY = 'flow_app_update_dismissed_v4.9.3';

export function NewContentNotification() {
  const navigate = useNavigate();
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showAppUpdateNotice, setShowAppUpdateNotice] = useState(false);

  const isNativeApp = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.() || BillingService.isNative());

  useEffect(() => {
    // 1. Neues Produkt aus Supabase abfragen
    getSupabase()
      .from('produkte')
      .select('id, titel, kategorie, preis, beschreibung, created_at, hoerprobe_url')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const newest = data[0];
          const lastSeenId = localStorage.getItem(LOCAL_STORAGE_KEY);

          // Wenn die Produkt-ID noch nicht als gesehen markiert wurde
          if (newest && newest.id !== lastSeenId) {
            setLatestProduct(newest);

            // Pop-up blockieren, solange der Cookiebanner nicht bestätigt/geschlossen wurde.
            // Sobald bestätigt, startet ein sanfter Delay (8 Sekunden), bevor der Hinweis erscheint.
            const startNotificationTimer = () => {
              return setTimeout(() => setIsVisible(true), 8000);
            };

            if (hasResolvedCookieConsent()) {
              const timer = startNotificationTimer();
              return () => clearTimeout(timer);
            } else {
              let timer: any = null;
              const handleConsent = () => {
                timer = startNotificationTimer();
              };
              window.addEventListener('cookie-consent-resolved', handleConsent, { once: true });
              return () => {
                window.removeEventListener('cookie-consent-resolved', handleConsent);
                if (timer) clearTimeout(timer);
              };
            }
          }
        }
      }, () => {});
  }, []);

  const handleDismissProduct = () => {
    if (latestProduct) {
      localStorage.setItem(LOCAL_STORAGE_KEY, latestProduct.id);
    }
    setIsVisible(false);
  };

  const handleGoToProduct = () => {
    if (latestProduct) {
      localStorage.setItem(LOCAL_STORAGE_KEY, latestProduct.id);
      setIsVisible(false);
      navigate(`/ruhe-shop#product-${latestProduct.id}`);
    }
  };

  const cleanTitel = (titel: string = '') => {
    return titel.replace(/\s*[–—]\s*/g, ' | ');
  };

  const formatPrice = (val: string | number) => {
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
    if (isNaN(num)) return String(val).replace('.', ',');
    return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getKategorieName = (kat: string = '') => {
    const k = kat.toLowerCase();
    if (k.includes('hypnose')) return 'Neue Selbsthypnose';
    if (k.includes('meditation')) return 'Neue Meditation';
    if (k.includes('buch') || k.includes('hörbuch')) return 'Neues Hörbuch';
    if (k.includes('entspannung')) return 'Neue Entspannungsübung';
    return 'Neuer Inhalt';
  };

  if (!isVisible || !latestProduct) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 250 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-[90] sm:w-96 bg-white/98 border border-stone-300 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-black/10 p-4.5 sm:p-5 backdrop-blur-xl text-stone-900 overflow-hidden"
      >
        {/* Dekorative Hintergrundwelle */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Header-Zeile mit Kategorie-Badge und Schließen-Button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#344034] text-white flex items-center gap-1 shadow-xs">
            <Sparkles size={11} /> ✨ Frisch erschienen
          </span>

          <button
            onClick={handleDismissProduct}
            aria-label="Hinweis schließen"
            className="p-1 text-stone-600 hover:text-stone-950 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Haupttext mit Titel und Kategorie */}
        <div className="space-y-1.5 mb-3">
          <h4 className="font-serif font-bold text-sm sm:text-base text-stone-950 leading-snug">
            {getKategorieName(latestProduct.kategorie)} verfügbar!
          </h4>
          <p className="text-xs text-stone-700 leading-relaxed font-normal">
            <span className="text-stone-950 font-bold">„{cleanTitel(latestProduct.titel)}“</span> ist jetzt im Ruhe-Shop verfügbar
            {parseFloat(latestProduct.preis) > 0 ? (
              <span className="whitespace-nowrap font-semibold text-stone-950">{` (${formatPrice(latestProduct.preis)}\u00A0€)`}</span>
            ) : (
              ' (Kostenfrei)'
            )}.
          </p>
        </div>

        {/* Aktions-Button */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200">
          <span className="text-[11px] text-stone-600 font-medium font-sans">
            {latestProduct.kategorie || 'Ruhe-Shop'}
          </span>

          <button
            onClick={handleGoToProduct}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Jetzt entdecken</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
