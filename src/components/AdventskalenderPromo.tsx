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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#F5F5F0] border border-[#8A9A8A]/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-left text-[#3D3B35]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dekorativer Lichtschein in Salbeigrün & Warmgold */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#8A9A8A]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-[#C8A96E]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Schließen-Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-stone-200/80 hover:bg-stone-300 text-[#695C4D] hover:text-[#3D3B35] transition-colors cursor-pointer z-10"
          aria-label="Adventskalender-Vorschau schließen"
        >
          <X size={18} />
        </button>

        {/* Top-Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#8A9A8A]/20 border border-[#8A9A8A]/40 text-[#4A563E] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={13} />
          <span>Dezember-Begleitung • 100 % Kostenfrei</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D3B35] leading-tight mb-2">
          Der Adventskalender – 24 Tage Innehalten
        </h2>

        <p className="text-xs sm:text-sm text-[#695C4D] leading-relaxed mb-5">
          Ein ganzheitlicher Begleiter durch den Dezember: vom bewussten Ankommen im Stillstand der
          Natur über die Wintersonnenwende bis zur Schwelle der heiligen Rauhnächte.
        </p>

        {/* 📱 Plattformweiche-Hinweis für App-Nutzer */}
        {isNativeApp && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#8A9A8A]/20 to-[#C8A96E]/15 border border-[#8A9A8A]/40 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8A9A8A] text-white flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-[#3D3B35] block mb-0.5">
                Interaktive Web-Erfahrung
              </span>
              <span className="text-[#695C4D] leading-relaxed">
                Das 24-Türchen-Erlebnis mit täglicher Entriegelung und Hörbuch-Verlosungen läuft
                vollständig im mobilen Browser. Du kannst den Kalender mit einem Klick öffnen.
              </span>
            </div>
          </div>
        )}

        {/* Die 4 Säulen kompakt */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {ADVENT_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="p-3 rounded-2xl bg-white border border-[#E3E1D9] text-center flex flex-col items-center justify-center shadow-xs"
            >
              <span className="text-lg mb-0.5">{pillar.emoji}</span>
              <span className="text-base sm:text-lg font-serif font-bold text-[#3D3B35]">
                {pillar.count}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9A8A]">
                {pillar.title}
              </span>
              <span className="text-[11px] text-[#695C4D] mt-1 leading-snug line-clamp-2">
                {pillar.description}
              </span>
            </div>
          ))}
        </div>

        {/* Highlight: 3x Rauhnacht-Hörbuch Gewinnspiele */}
        <div className="p-4 rounded-2xl bg-[#C8A96E]/15 border border-[#C8A96E]/40 mb-5 flex flex-col sm:flex-row items-center gap-3.5">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#C8A96E]/50 shrink-0 shadow-sm bg-stone-900">
            <img
              src="/images/products/cover_rauhnaechte.jpg"
              alt="Yggdrasils Atem – 12 Rauhnächte"
              className="w-full h-full object-cover"
              onError={(e: any) => {
                e.target.src = '/images/products/cover_schmetterling.jpg';
              }}
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6E531D] flex items-center justify-center sm:justify-start gap-1.5">
              <Gift size={14} />
              <span>3 × Große Hörbuch-Verlosung im Kalender</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3D3B35] font-medium mt-0.5">
              Am <strong>06. Dez (Nikolaus)</strong>, <strong>13. Dez (Halbzeit)</strong> &amp;{' '}
              <strong>21. Dez (Sonnenwende)</strong> verlosen wir unser neues Werk{' '}
              <em>„Yggdrasils Atem – 12 Rauhnächte auf der Schwelle“</em>!
            </p>
          </div>
        </div>

        {/* E-Mail-Erinnerung mit Resend-Anbindung */}
        <form
          onSubmit={handleSubscribe}
          className="mb-5 p-4 rounded-2xl bg-white border border-[#E3E1D9]"
        >
          <label className="block text-xs font-bold text-[#3D3B35] mb-1.5">
            🔔 Tägliche Erinnerung für das neue Türchen erhalten (0&nbsp;€):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-[#E3E1D9] text-xs sm:text-sm text-[#3D3B35] focus:outline-none focus:ring-2 focus:ring-[#8A9A8A]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-[#8A9A8A] hover:bg-[#728372] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60 shadow-xs"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              <span>Erinnerung aktivieren</span>
            </button>
          </div>
          {statusMsg && (
            <p
              className={`text-xs mt-2 font-medium ${
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
        <div className="flex flex-col sm:flex-row gap-3">
          {isNativeApp ? (
            <button
              type="button"
              onClick={openInExternalBrowser}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-[#8A9A8A] hover:bg-[#728372] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink size={16} />
              <span>Im Browser öffnen (24 Türchen)</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <Link
              to="/adventskalender"
              onClick={onClose}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-[#8A9A8A] hover:bg-[#728372] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar size={16} />
              <span>Zu den 24 Türchen</span>
              <ArrowRight size={16} />
            </Link>
          )}

          <button
            onClick={onClose}
            className="py-3.5 px-4 rounded-2xl bg-stone-200 hover:bg-stone-300 text-[#695C4D] font-semibold text-xs sm:text-sm text-center transition-colors cursor-pointer"
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
  const [isAdminUser, setIsAdminUser] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('flow_admin_preview') === 'true') {
      return true;
    }
    return isKnownAdminEmail(user?.email);
  });

  const isNativeApp = typeof window !== 'undefined' && BillingService.isNative();

  useEffect(() => {
    if (!user) {
      setIsAdminUser(
        typeof window !== 'undefined' && localStorage.getItem('flow_admin_preview') === 'true'
      );
      return;
    }
    if (isKnownAdminEmail(user.email)) {
      setIsAdminUser(true);
      return;
    }
    checkUserIsAdmin(user.id, user.email).then((res) => {
      setIsAdminUser(res);
    });
  }, [user]);

  // Automatisches einmaliges Einblenden als Pop-Up (aktuell in Vorbereitung nur für Admins)
  useEffect(() => {
    if (!isAdminUser) return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('popup') === 'advent') {
        setIsPopupOpen(true);
        return;
      }
      const alreadySeen = sessionStorage.getItem(POPUP_STORAGE_KEY);
      if (!alreadySeen) {
        const timer = setTimeout(() => {
          setIsPopupOpen(true);
          sessionStorage.setItem(POPUP_STORAGE_KEY, 'true');
        }, 3500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [isAdminUser]);

  if (!isAdminUser) {
    return null;
  }

  return (
    <>
      <section
        id="adventskalender-teaser"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8A9A8A]/20 via-[#F5F5F0] to-[#8A9A8A]/15 text-[#3D3B35] p-5 sm:p-7 md:p-8 border border-[#8A9A8A]/40 shadow-sm"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#8A9A8A]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#C8A96E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E1D9] pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A9A8A]/20 border border-[#8A9A8A]/40 text-[#4A563E] text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={13} />
                  <span>Flow der Stille • Winter- &amp; Adventsbegleitung</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                  <span>🔒 Nur für Admins sichtbar (Vorschau)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#3D3B35] leading-tight">
                Der Adventskalender – 24 Tage Innehalten
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#695C4D] max-w-2xl leading-relaxed">
                Klassisches 24-Türchen-Raster: Tag für Tag öffnet sich ein neuer Impuls zur
                Entschleunigung für dein Nervensystem.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              {isNativeApp ? (
                <button
                  type="button"
                  onClick={() => window.open(WEB_CALENDAR_URL, '_blank', 'noopener,noreferrer')}
                  className="px-5 py-3 rounded-2xl bg-[#8A9A8A] hover:bg-[#728372] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ExternalLink size={16} />
                  <span>Im Browser öffnen</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <Link
                  to="/adventskalender"
                  className="px-5 py-3 rounded-2xl bg-[#8A9A8A] hover:bg-[#728372] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Calendar size={16} />
                  <span>Zum 24-Türchen-Kalender</span>
                  <ArrowRight size={16} />
                </Link>
              )}

              <button
                onClick={() => setIsPopupOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-[#E3E1D9] text-[#695C4D] font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <Gift size={14} className="text-[#8A9A8A]" />
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
