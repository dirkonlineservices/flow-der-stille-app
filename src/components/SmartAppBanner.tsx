import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.flowderstille.de';

export default function SmartAppBanner() {
  // 🚀 Synchron initialisieren: Verhindert, dass der Banner 100ms nach Render den gesamten Inhalt herunterschiebt (CLS)
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isNative = Boolean((window as any).Capacitor?.isNativePlatform?.());
    if (isNative) return false;
    return sessionStorage.getItem('fds_smart_banner_dismissed') !== 'true';
  });

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('fds_smart_banner_dismissed', 'true');
  };

  const handleDownloadClick = () => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'app_download_click',
        source: 'smart_app_banner',
        destination: 'google_play_store'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[var(--bg-card)] border-b border-[var(--border)] px-3 py-2.5 flex items-center justify-between gap-3 shadow-xs relative z-50 text-[var(--text-main)]">
      {/* Schließen Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-full hover:bg-[var(--bg-alt)] transition-colors shrink-0 cursor-pointer"
        aria-label="Banner schließen"
      >
        <X size={16} />
      </button>

      {/* App Icon + Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-emerald-50 dark:bg-stone-800 border border-[var(--border)] shrink-0 flex items-center justify-center p-1 shadow-2xs">
          <img
            src="/logo-transparent.png"
            alt="Flow der Stille App Icon"
            width="40"
            height="40"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-bold text-xs sm:text-sm truncate leading-tight flex items-center gap-2">
            <span>Flow der Stille: Innere Ruhe</span>
            <span className="text-[10px] bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full hidden sm:inline">Android App</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">
            <div className="flex items-center text-amber-500 shrink-0">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="ml-0.5 font-bold text-[10px]">5.0</span>
            </div>
            <span>•</span>
            <span className="font-medium text-[var(--text-main)]">Android App jetzt herunterladen</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline opacity-75">(iOS folgt im nächsten Monat)</span>
          </div>
        </div>
      </div>

      {/* Download Action Button */}
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownloadClick}
        className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0 flex items-center gap-1 cursor-pointer whitespace-nowrap"
      >
        <span>APP HERUNTERLADEN</span>
      </a>
    </div>
  );
}
