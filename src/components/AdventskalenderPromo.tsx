import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Gift, Calendar, X, ArrowRight, CheckCircle2,
  Mail, Loader2, ExternalLink, Smartphone
} from 'lucide-react';
import { ADVENT_PILLARS } from '../data/adventskalender';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { useAuth } from '../context/AuthContext';
import { checkUserIsAdmin, isKnownAdminEmail } from '../lib/adminSecurity';
import { BillingService } from '../lib/billing';
import { hasResolvedCookieConsent } from '../lib/tracking';

const POPUP_STORAGE_KEY = 'fds_adventskalender_popup_seen_2026_v1';
const WEB_CALENDAR_URL = 'https://flow-der-stille.de/adventskalender';

interface AdventskalenderPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdventskalenderPopupModal: React.FC<AdventskalenderPopupModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Plattform-Erkennung: Läuft der Code nativ in der Android / iOS App?
  const isNativeApp = typeof window !== 'undefined' && BillingService.isNative();

  // Hintergrund-Scroll sperren, solange das Pop-up aktiv ist
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  if (!isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatusMsg({ type: 'error', text: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
      return;
    }
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await subscribeToNewsletter({
        email: email.trim(),
        userId: user?.id,
        source: isNativeApp ? 'adventskalender_popup_app_2026' : 'adventskalender_popup_web_2026'
      });
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text:
            res.message ||
            'Fast geschafft! Bitte bestätige kurz den Link in deiner E-Mail für deine tägliche Advents-Begleitung.'
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: res.message || 'Anmeldung konnte nicht abgeschlossen werden.'
        });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Ein unerwarteter Fehler ist aufgetreten.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openInExternalBrowser = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.open(WEB_CALENDAR_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none overscroll-contain"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#F5F5F0] border border-[#8A9A8A]/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-left text-[#3D3B35] select-none overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dekorativer Lichtschein in Salbeigrün & Warmgold */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#8A9A8A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#C8A96E]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Schließen-Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-200/80 hover:bg-stone-300 text-[#695C4D] hover:text-[#3D3B35] transition-colors cursor-pointer z-10"
          aria-label="Adventskalender-Vorschau schließen"
        >
          <X size={16} />
        </button>

        {/* Top-Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles size={12} />
          <span>Dezember-Begleitung · Kostenfrei</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-950 leading-tight mb-1.5">
          Adventskalender: 24 Tage Innehalten
        </h2>

        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-3.5 font-normal">
          Ein ruhiger Begleiter durch den Dezember. Vom Ankommen im Stillstand der Natur über die Wintersonnenwende bis zur Schwelle der heiligen Rauhnächte öffnet sich Tag für Tag ein neuer Impuls.
        </p>

        {/* Plattformweiche-Hinweis für App-Nutzer */}
        {isNativeApp && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-600/30 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
              <Smartphone size={16} />
            </div>
            <div className="text-xs">
              <span className="font-bold text-stone-950 block mb-0.5">
                Interaktive Web-Erfahrung
              </span>
              <span className="text-stone-700 leading-relaxed font-normal">
                Das 24-Türchen-Erlebnis mit täglicher Entriegelung und Hörbuch-Verlosungen läuft im mobilen Browser. Du kannst den Kalender mit einem Klick öffnen.
              </span>
            </div>
          </div>
        )}

        {/* Die 4 Säulen kompakt */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
          {ADVENT_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E3E1D9] text-center flex flex-col items-center justify-center shadow-xs"
            >
              <span className="text-base mb-0.5">{pillar.emoji}</span>
              <span className="text-sm font-serif font-bold text-stone-950">
                {pillar.count}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#344034]">
                {pillar.title}
              </span>
            </div>
          ))}
        </div>

        {/* Highlight: 3x Rauhnacht-Hörbuch Gewinnspiele */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 mb-3.5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-amber-300 shrink-0 shadow-xs bg-stone-900">
            <img
              src="/images/products/cover_rauhnaechte.jpg"
              alt="Yggdrasils Atem | 12 Rauhnächte"
              draggable={false}
              className="w-full h-full object-cover select-none pointer-events-none"
              onError={(e: any) => {
                e.target.src = '/images/products/cover_schmetterling.jpg';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Gift size={13} />
              <span>3 × Hörbuch-Verlosung im Kalender</span>
            </div>
            <p className="text-xs text-stone-950 font-semibold mt-0.5 leading-snug">
              Am 06. Dez (Nikolaus), 13. Dez (Halbzeit) und 21. Dez (Sonnenwende) verlosen wir das Werk <em>„Yggdrasils Atem“</em>.
            </p>
          </div>
        </div>

        {/* E-Mail-Erinnerung mit Resend-Anbindung */}
        <form
          onSubmit={handleSubscribe}
          className="mb-3.5 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs"
        >
          <label className="block text-xs font-bold text-stone-950 mb-1.5">
            🔔 Tägliche Erinnerung für das neue Türchen erhalten (kostenfrei):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60 shadow-xs active:scale-95"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              <span>Erinnerung aktivieren</span>
            </button>
          </div>
          {statusMsg && (
            <p
              className={`text-xs mt-1.5 font-medium ${
                statusMsg.type === 'success'
                  ? 'text-emerald-700'
                  : 'text-red-600'
              }`}
            >
              {statusMsg.text}
            </p>
          )}
        </form>

        {/* Plattform-Aktions-Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {isNativeApp ? (
            <button
              type="button"
              onClick={openInExternalBrowser}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ExternalLink size={15} />
              <span>Im Browser öffnen (24 Türchen)</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <Link
              to="/adventskalender"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Calendar size={15} />
              <span>Zu den 24 Türchen</span>
              <ArrowRight size={15} />
            </Link>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-[#695C4D] font-semibold text-xs sm:text-sm text-center transition-colors cursor-pointer"
          >
            Später ansehen
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdventskalenderHomeSection: React.FC = () => {
  const { user } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const isNativeApp = typeof window !== 'undefined' && BillingService.isNative();

  // Automatisches Einblenden als Pop-Up: Frühestens 20 Sekunden nach Cookie-Entscheidung
  // Dauerhaft unterdrückt, sobald die Adventskalender-Seite einmal besucht wurde.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('popup') === 'advent') {
        setIsPopupOpen(true);
        return;
      }

      // 1. Hat der Nutzer den Adventskalender bereits besucht? -> Dauerhaft unterdrücken!
      const hasVisited =
        localStorage.getItem('hasVisitedAdventskalender') === 'true' ||
        localStorage.getItem('fds_advent_visited') === 'true';
      if (hasVisited) {
        return;
      }

      // 2. In dieser Sitzung bereits gesehen?
      const alreadySeen = sessionStorage.getItem(POPUP_STORAGE_KEY);
      if (alreadySeen) {
        return;
      }

      // 3. Timer-Start: Frühestens 20 Sekunden nach Bestätigung des Cookiebanners
      let timer: any = null;
      const start20sTimer = () => {
        timer = setTimeout(() => {
          const visitedNow =
            localStorage.getItem('hasVisitedAdventskalender') === 'true' ||
            localStorage.getItem('fds_advent_visited') === 'true';
          if (!visitedNow) {
            setIsPopupOpen(true);
            sessionStorage.setItem(POPUP_STORAGE_KEY, 'true');
          }
        }, 20000); // Exakt 20 Sekunden Verweildauer
      };

      if (hasResolvedCookieConsent()) {
        start20sTimer();
      } else {
        const onConsentResolved = () => {
          start20sTimer();
        };
        window.addEventListener('cookie-consent-resolved', onConsentResolved, { once: true });
        return () => {
          window.removeEventListener('cookie-consent-resolved', onConsentResolved);
          if (timer) clearTimeout(timer);
        };
      }

      return () => {
        if (timer) clearTimeout(timer);
      };
    } catch {}
  }, []);

  return (
    <>
      <section
        id="adventskalender-teaser"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#8A9A8A]/20 via-[#F5F5F0] to-[#8A9A8A]/15 text-[#3D3B35] p-4 sm:p-6 md:p-8 border border-[#8A9A8A]/40 shadow-sm"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#8A9A8A]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#C8A96E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E1D9] pb-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Flow der Stille · Winter- und Adventsbegleitung</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-950 leading-tight">
                Der Adventskalender: 24 Tage Innehalten
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-stone-700 max-w-2xl leading-relaxed font-normal">
                Vom bewussten Ankommen im Stillstand der Natur über die Wintersonnenwende bis zur
                Schwelle der heiligen Rauhnächte. Tag für Tag öffnet sich ein neuer Impuls zur
                Entspannung für dein Nervensystem.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              {isNativeApp ? (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('hasVisitedAdventskalender', 'true');
                      localStorage.setItem('fds_advent_visited', 'true');
                    } catch {}
                    window.open(WEB_CALENDAR_URL, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <ExternalLink size={16} />
                  <span>Im Browser öffnen</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <Link
                  to="/adventskalender"
                  onClick={() => {
                    try {
                      localStorage.setItem('hasVisitedAdventskalender', 'true');
                      localStorage.setItem('fds_advent_visited', 'true');
                    } catch {}
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Calendar size={16} />
                  <span>Zum 24-Türchen-Kalender</span>
                  <ArrowRight size={16} />
                </Link>
              )}

              <button
                onClick={() => setIsPopupOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-[#E3E1D9] text-stone-900 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs text-center"
              >
                <Gift size={14} className="text-emerald-800" />
                <span>Schnellvorschau (Pop-Up)</span>
              </button>
            </div>
          </div>

          {/* 4 Säulen Übersicht */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ADVENT_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="p-4 rounded-2xl bg-white border border-[#E3E1D9] flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{pillar.emoji}</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-[#8A9A8A]">
                    {pillar.count}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#3D3B35]">
                    {pillar.title}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#695C4D] mt-1 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pop-Up Modal */}
      <AdventskalenderPopupModal
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};
