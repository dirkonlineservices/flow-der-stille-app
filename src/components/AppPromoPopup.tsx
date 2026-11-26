import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Tag, X, ArrowRight } from 'lucide-react';
import { loadAppPromo, AppPromoConfig } from '../lib/promo';

/**
 * Popup inside the native apps announcing a store-side price promotion.
 * Controlled via app_config (promo_app_aktiv, promo_app_plattformen, promo_*).
 * Shown once per promotion (keyed by promo_start).
 */
function formatEnd(date: Date | null): string {
  if (!date) return '';
  const weekday = date.toLocaleDateString('de-DE', { weekday: 'long', timeZone: 'Europe/Berlin' });
  const day = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Berlin' });
  return `bis ${weekday}, ${day}, 24 Uhr`;
}

export const AppPromoPopup: React.FC = () => {
  const navigate = useNavigate();
  const [promo, setPromo] = useState<AppPromoConfig | null>(null);
  const [storageKey, setStorageKey] = useState('');

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      const p = await loadAppPromo(Capacitor.getPlatform());
      if (!active || !p) return;
      const key = `fds_app_promo_seen_${p.startsAt?.toISOString() || p.title}`;
      try {
        if (localStorage.getItem(key) === 'true') return;
      } catch {}
      setStorageKey(key);
      setPromo(p);
    }, 2500);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  if (!promo) return null;

  const close = () => {
    try { localStorage.setItem(storageKey, 'true'); } catch {}
    setPromo(null);
  };

  const openShop = () => {
    close();
    navigate('/ruhe-shop');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="app-promo-title">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl text-center">
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-stone-100 text-stone-700"
          aria-label="Schließen"
        >
          <X size={18} />
        </button>

        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-stone-950 font-bold text-xs">
          <Tag size={13} />
          <span className="whitespace-nowrap">{promo.percent}&nbsp;% Rabatt</span>
        </span>

        <h2 id="app-promo-title" className="mt-4 font-serif text-2xl font-bold text-stone-950">
          {promo.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-800">
          Alle Selbsthypnosen, Meditationen und Hörbücher im Ruhe-Shop sind {formatEnd(promo.endsAt)} günstiger.
          Einmalkauf, kein Abo.
        </p>

        <button
          type="button"
          onClick={openShop}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm"
        >
          Zum Ruhe-Shop
          <ArrowRight size={16} />
        </button>
        <button type="button" onClick={close} className="mt-2 w-full py-2 text-sm font-semibold text-stone-700">
          Vielleicht später
        </button>
      </div>
    </div>
  );
};

export default AppPromoPopup;
