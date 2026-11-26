import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tag, ArrowRight, X } from 'lucide-react';
import { useLivePromo } from '../lib/promo';

const STORAGE_KEY = 'fds_promo_banner_dismissed';

function formatEnd(date: Date | null): string {
  if (!date) return '';
  const weekday = date.toLocaleDateString('de-DE', { weekday: 'long', timeZone: 'Europe/Berlin' });
  const day = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Berlin' });
  return `Bis ${weekday}, ${day}, 24 Uhr`;
}

export const PromoTopBanner: React.FC = () => {
  const promo = useLivePromo();
  const location = useLocation();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (!promo || dismissed) return null;

  const onShopPage = location.pathname.toLowerCase().startsWith('/ruhe-shop');

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  };

  return (
    <aside
      aria-label={`${promo.title}: ${promo.percent} Prozent Rabatt`}
      className="relative z-20 w-full bg-stone-950 text-white border-b border-stone-800"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:pr-56 py-2.5 relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm shrink-0">
          <Tag size={14} className="shrink-0" />
          <span>{promo.title}</span>
          <span aria-hidden="true">|</span>
          <span className="whitespace-nowrap">{promo.percent}&nbsp;% Rabatt</span>
        </span>

        <p className="text-xs sm:text-sm text-white leading-normal max-w-xl pr-6 sm:pr-0">
          <strong className="font-semibold">Auf alle Selbsthypnosen, Meditationen und Hörbücher im Ruhe-Shop.</strong>{' '}
          <span className="text-stone-200">{formatEnd(promo.endsAt)}. Einmalkauf, kein Abo.</span>
        </p>

        {!onShopPage && (
          <Link
            to="/ruhe-shop"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 text-stone-950 text-xs font-bold transition-colors shrink-0"
          >
            <span>Zum Ruhe-Shop</span>
            <ArrowRight size={13} />
          </Link>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 sm:right-3 md:relative md:top-auto md:right-auto md:ml-2 p-1.5 rounded-full hover:bg-white/15 text-stone-200 hover:text-white transition-colors cursor-pointer shrink-0"
          aria-label="Hinweis ausblenden"
          title="Hinweis ausblenden"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};

export default PromoTopBanner;
