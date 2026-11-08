import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles, Gift, CheckCircle2, ArrowRight, Mail, Loader2, X, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { getSupabase } from '../lib/supabaseClient';

const BANNER_STORAGE_KEY = 'fds_advent_top_banner_dismissed_2026';

export const AdventTopBanner: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(BANNER_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Auf den Adventskalender-Seiten selbst wird kein Banner benötigt (Dopplung vermeiden)
  const isAdventPage = ['/adventskalender', '/weihnachtskalender', '/advent'].includes(location.pathname.toLowerCase());

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

  if (dismissed || isAdventPage) return null;

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
      className="relative z-20 w-full bg-gradient-to-r from-[#8A9A8A]/20 via-[#F5F5F0] to-[#C8A96E]/20 border-b border-[#E3E1D9] text-[#3D3B35] transition-all duration-300"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:pr-56 py-2.5 sm:py-3 relative flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 text-center">
        {/* Größeres, harmonisches Salbeigrün-Badge mit deutlichem Kostenfrei-Hinweis - immer zentriert & frei stehend */}
        <div className="w-full md:w-auto flex justify-center py-0.5 shrink-0">
          <Link
            to="/adventskalender"
            onClick={() => {
              try {
                localStorage.setItem('hasVisitedAdventskalender', 'true');
                localStorage.setItem('fds_advent_visited', 'true');
              } catch {}
            }}
            className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
            title="Zum kostenfreien Adventskalender"
          >
            <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="font-serif font-bold tracking-tight text-white">Adventskalender</span>
            <span className="text-white/60 text-xs">|</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs tracking-wide">
              Kostenfrei
            </span>
          </Link>
        </div>

        {/* Text-Botschaft / Persönliche Ansprache */}
        {user ? (
          <div className="text-xs sm:text-sm text-stone-800 font-medium leading-normal flex items-center gap-1.5 flex-wrap justify-center">
            <span>Hallo <strong className="font-bold text-stone-950">{userName}</strong>!</span>
            {isSubscribed ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/90 px-2.5 py-0.5 rounded-full text-xs shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-700" />
                Für tägliche Türchen vorgemerkt
              </span>
            ) : (
              <span className="text-stone-600">
                24 Tage Innehalten und Hörbuch-Verlosungen starten am 1. Dezember.
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-stone-800 font-medium leading-normal max-w-xl">
            <strong className="font-semibold text-stone-950">24 Tage Innehalten.</strong>
            <span className="text-stone-600"> Täglich kostenfreie Meditationen und Hörbuch-Gewinnspiele ab 1. Dezember.</span>
          </div>
        )}

        {/* Zentriertes E-Mail-Formular & Absendebutton für Gäste */}
        {!user && !isSubscribed && (
          <form onSubmit={handleGuestSubmit} className="flex flex-wrap items-center justify-center gap-1.5 shrink-0 w-full md:w-auto">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Deine E-Mail-Adresse..."
              required
              className="px-3.5 py-1.5 rounded-full bg-white border border-stone-300 text-xs text-stone-950 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 w-44 sm:w-52 shadow-2xs transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 disabled:opacity-60 flex items-center gap-1.5 active:scale-95"
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-emerald-700 text-emerald-900 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Bell size={13} className="text-emerald-700" />
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
        >
          <span>Zum Kalender</span>
          <ArrowRight size={13} className="text-emerald-800" />
        </Link>

        {/* Schließen-Button - mobil oben rechts, ab Tablet/Desktop mit sicherem Abstand im Inhaltsfluss */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2 sm:right-3 md:relative md:top-auto md:right-auto md:translate-y-0 md:ml-3 p-1.5 rounded-full hover:bg-black/10 text-stone-600 hover:text-stone-950 transition-colors cursor-pointer shrink-0"
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

