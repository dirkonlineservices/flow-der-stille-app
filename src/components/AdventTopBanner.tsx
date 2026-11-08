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
      className="relative z-30 w-full bg-gradient-to-r from-[#8A9A8A]/20 via-[#F5F5F0] to-[#C8A96E]/20 border-b border-[#E3E1D9] text-[#3D3B35] transition-all duration-300"
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-12 py-3 sm:py-3.5 relative flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5 text-center">
        {/* Größeres, harmonisches Salbeigrün-Badge mit deutlichem 0 € Hinweis */}
        <Link
          to="/adventskalender"
          onClick={() => {
            try {
              localStorage.setItem('hasVisitedAdventskalender', 'true');
              localStorage.setItem('fds_advent_visited', 'true');
            } catch {}
          }}
          className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#8A9A8A] hover:bg-[#728372] text-white font-medium text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer hover:scale-[1.02]"
          title="Zum kostenfreien Adventskalender (0 €)"
        >
          <Sparkles className="w-4 h-4 text-[#F5F5F0] shrink-0" />
          <span className="font-serif font-bold tracking-tight text-white">Adventskalender</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-bold text-xs sm:text-sm tracking-wide">
            0&nbsp;€
          </span>
        </Link>

        {/* Text-Botschaft / Persönliche Ansprache */}
        {user ? (
          <div className="text-xs sm:text-sm text-[#3D3B35] font-medium leading-normal flex items-center gap-1.5 flex-wrap justify-center">
            <span>Hallo <strong className="font-bold text-[#344034]">{userName}</strong>!</span>
            {isSubscribed ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/90 px-2.5 py-0.5 rounded-full text-xs shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-700" />
                Für tägliche Türchen vorgemerkt
              </span>
            ) : (
              <span className="text-[#695C4D]">
                24 Tage Innehalten &amp; Hörbuch-Verlosungen starten am 1. Dezember.
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-[#3D3B35] font-medium leading-normal">
            <strong className="font-semibold text-[#344034]">24 Tage Innehalten</strong>
            <span className="text-[#695C4D]"> – Täglich Meditationen &amp; Hörbuch-Gewinnspiele ab 1. Dez.</span>
          </div>
        )}

        {/* Zentriertes E-Mail-Formular & Absendebutton für Gäste */}
        {!user && !isSubscribed && (
          <form onSubmit={handleGuestSubmit} className="inline-flex items-center gap-1.5 shrink-0 flex-wrap justify-center">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Deine E-Mail-Adresse..."
              required
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#8A9A8A]/50 text-xs text-[#3D3B35] placeholder:text-[#695C4D]/60 focus:outline-none focus:ring-2 focus:ring-[#8A9A8A] w-44 sm:w-52 shadow-2xs transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-[#8A9A8A] hover:bg-[#728372] text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 disabled:opacity-60 flex items-center gap-1.5 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Bell size={13} />
              )}
              <span>Erinnern</span>
            </button>
          </form>
        )}

        {/* 1-Klick Vormerkung für eingeloggten Nutzer */}
        {user && !isSubscribed && (
          <button
            type="button"
            onClick={handleQuickOptinForUser}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-[#8A9A8A] text-[#4A563E] text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Bell size={13} className="text-[#8A9A8A]" />
            )}
            <span>Erinnerung vormerken</span>
          </button>
        )}

        {/* Feedback-Meldung */}
        {feedbackMsg && (
          <span className="text-xs text-emerald-800 font-semibold px-2.5 py-1 bg-emerald-100/90 rounded-full shadow-2xs">
            {feedbackMsg}
          </span>
        )}

        {/* Direkter Link zum Kalender */}
        <Link
          to="/adventskalender"
          onClick={() => {
            try {
              localStorage.setItem('hasVisitedAdventskalender', 'true');
              localStorage.setItem('fds_advent_visited', 'true');
            } catch {}
          }}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 text-[#3D3B35] border border-[#E3E1D9] text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
        >
          <span>Zum Kalender</span>
          <ArrowRight size={13} className="text-[#8A9A8A]" />
        </Link>

        {/* Schließen-Button am rechten Rand */}
        <button
          type="button"
          onClick={handleDismiss}
          className="sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2 p-1.5 rounded-full hover:bg-black/5 text-[#695C4D] hover:text-[#3D3B35] transition-colors cursor-pointer shrink-0"
          aria-label="Banner ausblenden"
          title="Diesen Hinweis ausblenden"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};

export default AdventTopBanner;

