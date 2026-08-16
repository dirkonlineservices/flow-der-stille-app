/**
 * PlayStoreUpdateModal.tsx – Automatischer Update-Hinweis für die Android App.
 *
 * Fragt auf nativen Android-Geräten direkt den Google Play Core SDK Status ab.
 * Ein Pop-up wird NUR DANN angezeigt, wenn eine neuere App-Version tatsächlich
 * im Google Play Store veröffentlicht und freigegeben wurde!
 *
 * Solange ein Update nur in der Entwicklungs- / Web-Umgebung existiert (z. B. in Anti Gravity)
 * und noch nicht bei Google Play hochgeladen wurde, bleibt dieses Pop-up stumm.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';

export function GooglePlayBadgeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.45 1.45 0 01-.61-1.186V3a1.45 1.45 0 01.609-1.186z" fill="#4285F4"/>
      <path d="M17.062 8.73L13.792 12l3.27 3.27 3.659-2.091c.712-.407.712-1.951 0-2.358l-3.659-2.091z" fill="#FBBC04"/>
      <path d="M3.609 1.814l10.183 10.186L17.062 8.73 6.136 2.486c-.752-.43-1.748-.288-2.527.328z" fill="#EA4335"/>
      <path d="M3.609 22.186l2.527.328 10.926-6.244-3.27-3.27L3.609 22.186z" fill="#34A853"/>
    </svg>
  );
}

export function PlayStoreUpdateModal() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [availableVersion, setAvailableVersion] = useState<string>('');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Nur auf nativen Android-Geräten ausführen! (Nicht auf der Website)
    if (!Capacitor.isNativePlatform()) return;

    let isMounted = true;

    async function checkForPlayStoreUpdate() {
      try {
        const info = await AppUpdate.getAppUpdateInfo();
        console.log('[PlayStoreUpdateCheck]', info);

        // UpdateAvailability: 2 = UPDATE_AVAILABLE in Google Play Store!
        if (info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE || (info.updateAvailability as any) === 2) {
          if (isMounted) {
            setUpdateAvailable(true);
            if (info.availableVersionName) {
              setAvailableVersion(info.availableVersionName);
            }
          }
        }
      } catch (err) {
        console.warn('[PlayStoreUpdateCheck] Update-Prüfung fehlgeschlagen (evtl. Entwicklungsumgebung):', err);
      }
    }

    checkForPlayStoreUpdate();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenPlayStore = async () => {
    try {
      await AppUpdate.openAppStore();
    } catch (e) {
      // Fallback: Direkter Play Store Link
      window.open('https://play.google.com/store/apps/details?id=com.flowderstille.app', '_system');
    }
  };

  if (!updateAvailable || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          onClick={() => setIsDismissed(true)}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[var(--accent)] overflow-hidden text-center z-10"
        >
          {/* Subtle Glow Background */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[var(--accent)]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4 shadow-sm relative">
            <GooglePlayBadgeIcon className="w-9 h-9" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">
              !
            </span>
          </div>

          {/* Header */}
          <h3 className="font-serif font-semibold text-xl text-[var(--text-main)] leading-snug">
            App-Aktualisierung verfügbar! 🚀
          </h3>

          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
            Eine neue Version von <strong>Flow der Stille</strong> {availableVersion ? `(${availableVersion})` : ''} steht jetzt für dich im Google Play Store bereit.
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-left text-xs text-[var(--text-main)] space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles size={14} className="text-[var(--accent)] shrink-0" />
              <span>Optimierte Audio-Wiedergabe &amp; neue Meditationen</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] pl-5">
              Aktualisiere jetzt, um alle Verbesserungen auf deinem Smartphone zu nutzen.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            <button
              onClick={handleOpenPlayStore}
              className="w-full py-3.5 px-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Jetzt im Play Store aktualisieren</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Später erinnern
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
