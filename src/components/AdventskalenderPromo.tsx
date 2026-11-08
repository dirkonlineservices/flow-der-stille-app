import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Gift, Calendar, X, ArrowRight, CheckCircle2,
  Mail, Loader2, BookOpen, Moon, Flame
} from 'lucide-react';
import { ADVENT_PILLARS, ADVENT_DAYS } from '../data/adventskalender';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { useAuth } from '../context/AuthContext';
import { checkUserIsAdmin, isKnownAdminEmail } from '../lib/adminSecurity';

const POPUP_STORAGE_KEY = 'fds_adventskalender_popup_seen_2026_v1';

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
        source: 'adventskalender_popup_2026'
      });
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: res.message || 'Fast geschafft! Bitte bestätige kurz den Link in deiner E-Mail für deine tägliche Advents-Begleitung.'
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

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-amber-500/40 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dekorativer Lichtschein */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Schließen-Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer z-10"
          aria-label="Adventskalender-Vorschau schließen"
        >
          <X size={18} />
        </button>

        {/* Top-Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={13} />
          <span>Dezember-Begleiter • 100 % Kostenfrei</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)] leading-tight mb-2">
          Der Adventskalender – 24 Tage Innehalten
        </h2>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-5">
          Ein ganzheitlicher Begleiter durch den Dezember: vom bewussten Ankommen im Stillstand der Natur über die Wintersonnenwende bis zur Schwelle der heiligen Rauhnächte.
        </p>

        {/* Die 4 Säulen kompakt */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {ADVENT_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-center flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-0.5">{pillar.emoji}</span>
              <span className="text-base sm:text-lg font-serif font-bold text-[var(--text-main)]">
                {pillar.count}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                {pillar.title}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 leading-snug line-clamp-2">
                {pillar.description}
              </span>
            </div>
          ))}
        </div>

        {/* Highlight: 3x Rauhnacht-Hörbuch Gewinnspiele */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-5 flex flex-col sm:flex-row items-center gap-3.5">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 shadow-sm">
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
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Gift size={14} />
              <span>3 × Große Hörbuch-Verlosung im Kalender</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-main)] font-medium mt-0.5">
              Am <strong>06. Dez (Nikolaus)</strong>, <strong>13. Dez (Halbzeit)</strong> &amp; <strong>21. Dez (Sonnenwende)</strong> verlosen wir unser neues Werk <em>„Yggdrasils Atem – 12 Rauhnächte auf der Schwelle“</em>!
            </p>
          </div>
        </div>

        {/* Optionale E-Mail-Erinnerung */}
        <form onSubmit={handleSubscribe} className="mb-5 p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
          <label className="block text-xs font-bold text-[var(--text-main)] mb-1.5">
            🔔 Tägliche Türchen-Impulse &amp; Verlosungs-Erinnerung kostenfrei per E-Mail erhalten:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              <span>Kostenfrei eintragen</span>
            </button>
          </div>
          {statusMsg && (
            <p
              className={`text-xs mt-2 font-medium ${
                statusMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {statusMsg.text}
            </p>
          )}
        </form>

        {/* Haupt-Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/adventskalender"
            onClick={onClose}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar size={16} />
            <span>Alle 24 Türchen &amp; Programm entdecken</span>
            <ArrowRight size={16} />
          </Link>
          <button
            onClick={onClose}
            className="py-3.5 px-4 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold text-xs sm:text-sm text-center transition-colors cursor-pointer"
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

  // Automatisches einmaliges Einblenden als Pop-Up (nur für Admins)
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

  const highlightDays = ADVENT_DAYS.filter((d) => [1, 6, 13, 21, 24].includes(d.day));

  return (
    <>
      <section
        id="adventskalender-teaser"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-stone-100 p-5 sm:p-7 md:p-8 border border-amber-500/30 shadow-lg"
      >
        {/* Sanfter goldener & waldgrüner Lichtschimmer */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={13} />
                  <span>Flow der Stille • Winter- &amp; Adventsbegleitung</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                  <span>🔒 Nur für Admins sichtbar (Vorschau)</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-white leading-tight">
                Der Adventskalender – 24 Tage Innehalten
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-stone-300 max-w-2xl leading-relaxed">
                Vom bewussten Ankommen im Stillstand der Natur über die Wintersonnenwende bis zur Schwelle der heiligen Rauhnächte: Entdecke jeden Tag einen achtsamen Impuls für dein Nervensystem.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <Link
                to="/adventskalender"
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Calendar size={16} />
                <span>Zum 24-Tage Adventskalender</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setIsPopupOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-stone-100 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Gift size={14} className="text-amber-300" />
                <span>Schnellvorschau (Pop-Up)</span>
              </button>
            </div>
          </div>

          {/* 4 Säulen Übersicht */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ADVENT_PILLARS.map((pillar) => (
              <Link
                key={pillar.title}
                to={`/adventskalender?kategorie=${pillar.category}`}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{pillar.emoji}</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                    {pillar.count}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-amber-200 transition-colors">
                    {pillar.title}
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-300 mt-1 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* 5 Ausgewählte Meilenstein-Tage als Vorschau-Leiste */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="font-bold uppercase tracking-wider text-amber-200/90 flex items-center gap-1.5">
                <Flame size={13} />
                <span>Wichtige Stationen &amp; Verlosungs-Tage im Dezember:</span>
              </span>
              <Link to="/adventskalender" className="text-amber-300 hover:underline font-semibold">
                Alle 24 Tage ansehen →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {highlightDays.map((item) => (
                <Link
                  key={item.day}
                  to={`/adventskalender?tag=${item.day}`}
                  className="p-3 rounded-xl bg-black/30 hover:bg-black/45 border border-white/10 hover:border-amber-400/40 transition flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                    <span>{item.dateLabel}</span>
                    <span>{item.emoji} {item.categoryLabel}</span>
                  </div>
                  <div className="text-xs font-serif font-bold text-white leading-snug">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                    {item.coreImpulse}
                  </div>
                </Link>
              ))}
            </div>
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

