import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { reportCriticalError } from '../lib/errorLogger';
import { Mail, Loader2, CheckCircle2, BellOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';

interface NewsletterBannerProps {
  variant: 'prominent' | 'in-content';
}

export default function NewsletterBanner({ variant }: NewsletterBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Newsletter-Status aus Supabase profiles
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!user) {
      setIsSubscribed(null);
      return;
    }

    let isMounted = true;
    async function checkSubscriptionStatus() {
      setStatusLoading(true);
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('profiles')
          .select('newsletter_subscribed, email')
          .eq('id', user!.id)
          .maybeSingle();

        if (isMounted && data) {
          setIsSubscribed(!!data.newsletter_subscribed);
          setUserEmail(data.email || user!.email || '');
        }
      } catch (e) {
        console.warn('[NewsletterBanner] Could not load subscription status:', e);
      } finally {
        if (isMounted) setStatusLoading(false);
      }
    }

    checkSubscriptionStatus();
    return () => { isMounted = false; };
  }, [user]);

  // Anmelden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setErrorMessage('');

    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'newsletter_subscribe',
        form_location: variant,
        user_id: user?.id ?? null
      });
    }

    try {
      const result = await subscribeToNewsletter({ email, source: `banner_${variant}`, userId: user?.id });
      if (result.success) {
        if (user) {
          const supabase = getSupabase();
          await supabase
            .from('profiles')
            .update({ newsletter_subscribed: true })
            .eq('id', user.id);
          setIsSubscribed(true);
          setUserEmail(email);
        } else {
          navigate(`/newsletter-bestaetigung?email=${encodeURIComponent(email)}`);
        }
      } else {
        setErrorMessage(result.message || 'Fehler bei der Anmeldung.');
      }
    } catch (err: any) {
      await reportCriticalError({ context: 'Newsletter-Anmeldung Banner', error: err, userEmail: email });
      setErrorMessage(err?.message || 'Unerwarteter Fehler bei der Anmeldung.');
    } finally {
      setLoading(false);
    }
  };

  // Abmelden
  const handleUnsubscribe = async () => {
    if (!user || loading) return;
    setLoading(true);

    try {
      const supabase = getSupabase();

      await supabase
        .from('profiles')
        .update({ newsletter_subscribed: false })
        .eq('id', user.id);

      if (userEmail) {
        await supabase
          .from('newsletter_leads')
          .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
          .eq('email', userEmail.toLowerCase().trim());
      }

      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'newsletter_unsubscribe',
          user_id: user.id,
          form_location: variant
        });
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error('[NewsletterBanner] Unsubscribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isProminent = variant === 'prominent';

  const wrapperClass = [
    isProminent
      ? 'p-8 md:p-12 bg-[var(--bg-alt)] rounded-3xl text-center shadow-sm border border-[var(--border)]'
      : 'p-6 border border-[var(--border)] rounded-2xl bg-[var(--bg-card)]',
    'transition-all duration-300 relative overflow-hidden'
  ].join(' ');

  // Lade-Skelett
  if (user && statusLoading) {
    return (
      <div className={wrapperClass}>
        <div className="animate-pulse flex flex-col gap-3 items-center">
          <div className="h-5 w-48 bg-[var(--border)] rounded-full" />
          <div className="h-4 w-64 bg-[var(--border)] rounded-full opacity-60" />
        </div>
      </div>
    );
  }

  // Bereits abonniert
  if (isSubscribed) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <div className="text-left">
            <p className="text-sm sm:text-base font-semibold text-[var(--text-main)]">
              Du bist für unseren Newsletter angemeldet 🌿
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Sanfte Impulse für mehr Stille landen direkt in deiner Inbox.
            </p>
          </div>
        </div>
        <button
          onClick={handleUnsubscribe}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer active:scale-95"
          aria-label="Vom Newsletter abmelden"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <BellOff size={14} />}
          <span>Abmelden</span>
        </button>
      </div>
    );
  }

  // Kompakte Leiste als Standard für alle Seiten
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-2xs">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row items-center justify-between gap-4"
      >
        {/* Linke Seite: Icon & Text */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto text-left">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-[var(--text-main)] leading-snug">
              Achtsamkeits-Impulse per E-Mail
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Kostenlos &amp; jederzeit mit einem Klick abmeldbar.
            </p>
          </div>
        </div>

        {/* Rechte Seite: E-Mail-Feld & Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-1 lg:justify-end">
          <div className="relative w-full sm:w-64">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Deine E-Mail-Adresse"
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm shadow-2xs placeholder:text-[var(--text-muted)]/70 transition-all"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-11 px-5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Anmelden...</span>
              </>
            ) : (
              <span>Zum Newsletter anmelden</span>
            )}
          </button>
        </div>
      </form>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-600 font-medium text-center lg:text-right">{errorMessage}</p>
      )}
    </div>
  );
}
