import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Gift, CheckCircle2, ArrowRight, Mail, Loader2, X, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { getSupabase } from '../lib/supabaseClient';

const BANNER_STORAGE_KEY = 'fds_advent_top_banner_dismissed_2026';

export const AdventTopBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(BANNER_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // State für Voranmeldung
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showInputForm, setShowInputForm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Name des eingeloggten Nutzers bestimmen
  const userName = user?.first_name || user?.username || (user?.email ? user.email.split('@')[0] : null);

  // Prüfen, ob der Nutzer bereits in `newsletter_leads` für den Adventskalender registriert ist
  useEffect(() => {
    if (!user?.email) return;

    let active = true;
    const checkLead = async () => {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('newsletter_leads')
          .select('id, status')
          .eq('email', user.email!.toLowerCase().trim())
          .maybeSingle();

        if (active && data) {
          setIsSubscribed(true);
        }
      } catch {
        // Falls Tabelle nicht lesbar, ignorieren
      }
    };

    checkLead();
    return () => {
      active = false;
    };
  }, [user]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(BANNER_STORAGE_KEY, 'true');
    } catch {}
  };

  // Voranmeldung für eingeloggten Nutzer mit 1 Klick
  const handleQuickOptinForUser = async () => {
    if (!user?.email || isSubmitting) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await subscribeToNewsletter({
        email: user.email.trim(),
        firstName: user.first_name || user.username,
        userId: user.id,
        source: 'advent_banner_quick_user'
      });

      if (res.success) {
        setIsSubscribed(true);
        setFeedbackMsg('Du bist vorgemerkt!');
      } else {
        setFeedbackMsg(res.message || 'Anmeldung fehlgeschlagen.');
      }
    } catch {
      setFeedbackMsg('Fehler beim Eintragen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Voranmeldung für Gast per E-Mail-Eingabe
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailInput.trim();
    if (!clean || !clean.includes('@') || isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await subscribeToNewsletter({
        email: clean,
        userId: user?.id,
        source: 'advent_banner_guest'
      });

      if (res.success) {
        setIsSubscribed(true);
        setShowInputForm(false);
        setFeedbackMsg('Fast geschafft! Bestätigungslink versendet.');
      } else {
        setFeedbackMsg(res.message || 'Fehler beim Eintragen.');
      }
    } catch {
      setFeedbackMsg('Fehler beim Eintragen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside
      aria-label="Weihnachtskalender Vorankündigung"
      className="relative z-40 w-full bg-gradient-to-r from-[#8A9A8A]/25 via-[#F5F5F0] to-[#C8A96E]/25 border-b border-[#E3E1D9] text-[#3D3B35] transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-2 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm">
        {/* Linke Seite: Kalender-Badge & Begrüßung */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
          <Link
            to="/adventskalender"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8A9A8A] text-white font-bold text-[11px] uppercase tracking-wider shadow-2xs hover:bg-[#728372] transition-colors shrink-0 cursor-pointer"
          >
            <span>🎄</span>
            <span>Weihnachtskalender</span>
          </Link>

          {/* Persönliche Ansprache für eingeloggte Nutzer */}
          {user ? (
            <span className="text-[#3D3B35] font-medium leading-tight">
              Hallo <strong className="text-[#3D3B35] font-bold">{userName}</strong>!{' '}
              {isSubscribed ? (
                <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  Für tägliche Türchen vorgemerkt
                </span>
              ) : (
                <span className="text-[#695C4D]">
                  24 Tage Innehalten &amp; Rauhnacht-Hörbuch Verlosungen starten am 1. Dezember.
                </span>
              )}
            </span>
          ) : (
            <span className="text-[#695C4D] font-medium leading-tight">
              <strong className="text-[#3D3B35]">24 Tage Innehalten</strong> – Starte am 1. Dezember
              mit täglichen Meditationen &amp; Hörbuch-Gewinnspielen.
            </span>
          )}
        </div>

        {/* Rechte Seite: Interaktions-Buttons / Voranmeldung */}
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          {/* Eingeloggter Nutzer: Wenn noch nicht vorgemerkt, 1-Klick Voranmeldung */}
          {user && !isSubscribed && (
            <button
              type="button"
              onClick={handleQuickOptinForUser}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-stone-50 border border-[#8A9A8A] text-[#4A563E] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Bell size={12} className="text-[#8A9A8A]" />
              )}
              <span>Erinnerung vormerken ({user.email})</span>
            </button>
          )}

          {/* Gast: Zeigt entweder Eingabefeld oder den Button "Vormerken" */}
          {!user && !isSubscribed && (
            <>
              {showInputForm ? (
                <form onSubmit={handleGuestSubmit} className="flex items-center gap-1.5">
                  <div className="relative">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Deine E-Mail..."
                      required
                      autoFocus
                      className="px-2.5 py-1 rounded-full bg-white border border-[#E3E1D9] text-xs text-[#3D3B35] focus:outline-none focus:ring-1 focus:ring-[#8A9A8A] w-40 sm:w-48"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1 rounded-full bg-[#8A9A8A] hover:bg-[#728372] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Vormerken'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInputForm(false)}
                    className="p-1 text-[#695C4D] hover:text-[#3D3B35] cursor-pointer"
                    aria-label="Abbrechen"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInputForm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-stone-50 border border-[#8A9A8A] text-[#4A563E] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Bell size={12} className="text-[#8A9A8A]" />
                  <span>Kostenlos vormerken</span>
                </button>
              )}
            </>
          )}

          {/* Feedback Text falls vorhanden */}
          {feedbackMsg && (
            <span className="text-[11px] text-emerald-800 font-semibold px-2 py-0.5 bg-emerald-50 rounded">
              {feedbackMsg}
            </span>
          )}

          {/* Link zum Kalender */}
          <Link
            to="/adventskalender"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-[#3D3B35] border border-[#E3E1D9] text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <span>Kalender ansehen</span>
            <ArrowRight size={13} className="text-[#8A9A8A]" />
          </Link>

          {/* Schließen-Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-black/5 text-[#695C4D] hover:text-[#3D3B35] transition-colors cursor-pointer"
            aria-label="Banner ausblenden"
            title="Diesen Hinweis ausblenden"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdventTopBanner;

