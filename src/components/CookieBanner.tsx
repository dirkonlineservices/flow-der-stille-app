import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { trackConsentUpdate } from '../lib/tracking';
import { 
  Cookie, 
  ShieldCheck, 
  Check, 
  Ban, 
  ExternalLink, 
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export type ConsentChoice = 'all' | 'necessary' | 'none' | null;

export const COOKIE_STORAGE_KEY = 'flow_cookie_consent_status';

export function updateGtagConsent(choice: 'all' | 'necessary' | 'none') {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    if (choice === 'all') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } else {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }
}

export function openCookieConsentModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-banner'));
  }
}

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentChoice>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (saved === 'all' || saved === 'necessary' || saved === 'none') {
      return saved as ConsentChoice;
    }
    return null;
  });

  const [isManuallyReopened, setIsManuallyReopened] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (consent && consent !== 'none') {
      updateGtagConsent(consent);
    }

    const handleOpenEvent = () => {
      setIsManuallyReopened(true);
    };

    window.addEventListener('open-cookie-banner', handleOpenEvent);
    return () => {
      window.removeEventListener('open-cookie-banner', handleOpenEvent);
    };
  }, [consent]);

  const handleSelectConsent = (choice: 'all' | 'necessary' | 'none') => {
    setConsent(choice);
    setIsManuallyReopened(false);
    localStorage.setItem(COOKIE_STORAGE_KEY, choice);
    updateGtagConsent(choice);
    trackConsentUpdate(choice === 'none' ? 'rejected' : choice);
  };

  const showModal = consent === null || isManuallyReopened;

  return (
    <>
      {/* 1. Einziger Cookie Consent Banner / Modal */}
      <AnimatePresence>
        {showModal && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[var(--bg-card,#FFFFFF)] border border-[var(--border,#E3E1D9)] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-[var(--text-main,#3D3B35)] relative my-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header section with Icon & Title */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 shadow-xs">
                  <Cookie size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] block mb-0.5">
                    Datenschutz & Einwilligung
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[var(--text-main,#3D3B35)] leading-tight">
                    Deine Privatsphäre ist uns wichtig
                  </h2>
                </div>
              </div>

              {/* Main Text */}
              <p className="text-sm text-[var(--text-muted,#695C4D)] leading-relaxed mb-5">
                Wir nutzen Cookies für notwendige Online-Dienste und verarbeiten Daten DSGVO-konform in Europa. Grundfunktionen sichern den reibungslosen Betrieb der Webseite ab, während Analyse-, Cloud- und Tracking-Dienste (Google Analytics, Google Tag Manager, Firebase u. a.) erst mit deiner Zustimmung aktiviert werden. 
                Erfahre mehr in unserer{' '}
                <Link
                  to="/datenschutz"
                  onClick={() => setIsManuallyReopened(false)}
                  className="text-[var(--accent,#8A9A8A)] underline font-medium hover:text-[var(--accent-hover,#728372)] inline-flex items-center gap-0.5 transition-colors"
                >
                  Datenschutzerklärung
                  <ExternalLink size={12} className="inline ml-0.5" />
                </Link>
                .
              </p>

              {/* Accordion Toggle for Details */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1.5 transition-colors py-1 focus:outline-none"
                >
                  <Info size={14} />
                  <span>{showDetails ? 'Details & Kategorien ausblenden' : 'Details & Kategorien anzeigen'}</span>
                  {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 space-y-2 text-xs"
                    >
                      {/* Category 1 */}
                      <div className="p-3 rounded-2xl bg-[var(--bg-alt,#F7F6F2)] border border-[var(--border,#E3E1D9)] flex items-start gap-2.5">
                        <ShieldCheck size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[var(--text-main)] flex items-center justify-between">
                            <span>1. Technisch notwendige Online-Dienste</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-semibold">Erforderlich</span>
                          </div>
                          <p className="text-[var(--text-muted)] mt-1 text-[11px] leading-relaxed">
                            <strong>Wann & Warum:</strong> Werden beim Aufruf automatisch für Kernfunktionen wie Seitennavigation, Login-Sitzungen und Sicherheit gesetzt. Sämtliche verarbeiteten Daten verbleiben DSGVO-konform in Europa.
                          </p>
                        </div>
                      </div>

                      {/* Category 2 */}
                      <div className="p-3 rounded-2xl bg-[var(--bg-alt,#F7F6F2)] border border-[var(--border,#E3E1D9)] flex items-start gap-2.5">
                        <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[var(--text-main)] flex items-center justify-between">
                            <span>2. Funktionelle Dienste & Einstellungen</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-[var(--text-muted)] font-semibold">Optional</span>
                          </div>
                          <p className="text-[var(--text-muted)] mt-1 text-[11px] leading-relaxed">
                            <strong>Wann & Warum:</strong> Speichern deine persönlichen Einstellungen (z. B. Theme, Sprach- oder Audio-Präferenzen) für deinen nächsten Besuch.
                          </p>
                        </div>
                      </div>

                      {/* Category 3 */}
                      <div className="p-3 rounded-2xl bg-[var(--bg-alt,#F7F6F2)] border border-[var(--border,#E3E1D9)] flex items-start gap-2.5">
                        <Cookie size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[var(--text-main)] flex items-center justify-between">
                            <span>3. Analyse, Tracking & Cloud-Dienste (Google Analytics, Firebase, GTM u. a.)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-[var(--text-muted)] font-semibold">Optional</span>
                          </div>
                          <p className="text-[var(--text-muted)] mt-1 text-[11px] leading-relaxed">
                            <strong>Wann & Warum:</strong> Werden erst bei ausdrücklicher Zustimmung („Alle akzeptieren“) aktiviert. Hierzu zählen externe Analyse- und Cloud-Dienste wie Google Analytics, Google Tag Manager, Firebase und vergleichbare Tools zur anonymisierten Auswertung und Funktionserweiterung.
                          </p>
                        </div>
                      </div>

                      {/* Category 4 */}
                      <div className="p-3 rounded-2xl bg-[var(--bg-alt,#F7F6F2)] border border-[var(--border,#E3E1D9)] flex items-start gap-2.5">
                        <ExternalLink size={16} className="text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[var(--text-main)] flex items-center justify-between">
                            <span>4. Marketing & Personalisierung</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-[var(--text-muted)] font-semibold">Optional</span>
                          </div>
                          <p className="text-[var(--text-muted)] mt-1 text-[11px] leading-relaxed">
                            <strong>Wann & Warum:</strong> Werden bei vollständiger Zustimmung genutzt, um die Relevanz von Inhalten zu messen und passende Empfehlungen anzuzeigen.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons Stack (Three explicit choices) */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-[var(--border,#E3E1D9)]">
                {/* 1. Primary: Alle akzeptieren */}
                <button
                  type="button"
                  onClick={() => handleSelectConsent('all')}
                  className="w-full py-3 px-5 rounded-2xl bg-[var(--accent,#8A9A8A)] hover:bg-[var(--accent-hover,#728372)] text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Check size={18} />
                  <span>Alle akzeptieren</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* 2. Secondary: Nur notwendige */}
                  <button
                    type="button"
                    onClick={() => handleSelectConsent('necessary')}
                    className="w-full py-2.5 px-4 rounded-xl border border-[var(--border,#E3E1D9)] bg-[var(--bg-alt,#F7F6F2)] hover:bg-[var(--border,#E3E1D9)] text-[var(--text-main,#3D3B35)] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck size={15} className="text-[var(--accent)] shrink-0" />
                    <span>Nur notwendige</span>
                  </button>

                  {/* 3. Reject All: Ablehnen */}
                  <button
                    type="button"
                    onClick={() => handleSelectConsent('none')}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Ban size={14} className="shrink-0" />
                    <span>Ablehnen</span>
                  </button>
                </div>
              </div>

              {/* Footer Legal Navigation Links */}
              <div className="mt-5 pt-3 flex items-center justify-center gap-3 text-xs text-[var(--text-muted)] border-t border-dashed border-[var(--border)]">
                <Link
                  to="/datenschutz"
                  onClick={() => setIsManuallyReopened(false)}
                  className="hover:underline hover:text-[var(--text-main)] transition-colors"
                >
                  Datenschutzerklärung
                </Link>
                <span className="text-stone-300">•</span>
                <Link
                  to="/impressum"
                  onClick={() => setIsManuallyReopened(false)}
                  className="hover:underline hover:text-[var(--text-main)] transition-colors"
                >
                  Impressum
                </Link>
                <span className="text-stone-300">•</span>
                <Link
                  to="/agb"
                  onClick={() => setIsManuallyReopened(false)}
                  className="hover:underline hover:text-[var(--text-main)] transition-colors"
                >
                  AGB
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Floating Cookie Settings Trigger Button (Visible when banner modal is closed) */}
      {!showModal && (
        <button
          type="button"
          onClick={() => setIsManuallyReopened(true)}
          className="fixed bottom-4 right-4 z-[9990] bg-[var(--bg-card,#FFFFFF)] border border-[var(--border,#E3E1D9)] text-[var(--text-main,#3D3B35)] hover:text-[var(--accent,#8A9A8A)] shadow-sm hover:shadow-md rounded-full px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group opacity-90 hover:opacity-100"
          title="Cookie-Einstellungen verwalten"
        >
          <Cookie size={14} className="text-[var(--accent)] group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Cookie-Einstellungen</span>
          <span className="sm:hidden">Cookies</span>
        </button>
      )}
    </>
  );
}

export default CookieBanner;
