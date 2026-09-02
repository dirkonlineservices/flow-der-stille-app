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
      <div className={wrapperClass}>
        <div className={`flex ${isProminent ? 'flex-col items-center gap-3' : 'flex-col sm:flex-row items-start sm:items-center gap-3'}`}>
          <span className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-[var(--accent)]" />
          </span>
          <div className={`flex-1 ${isProminent ? 'text-center' : 'text-left'}`}>
            <p className="text-sm font-semibold text-[var(--text-main)] leading-snug">
              Du bist für unseren Newsletter angemeldet 🌿
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
              Sanfte Impulse für mehr Stille landen direkt in deiner Inbox.
            </p>
          </div>
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] bg-[var(--bg-main)] hover:bg-[var(--bg-card)] px-3 py-2 rounded-xl transition-all shrink-0 disabled:opacity-50 cursor-pointer active:scale-95"
            aria-label="Vom Newsletter abmelden"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <BellOff size={13} />}
            <span>Abmelden</span>
          </button>
        </div>
      </div>
    );
  }

  // Standard: Anmeldeformular
  return (
    <div className={wrapperClass}>
      <h2 className={`${isProminent ? 'text-2xl md:text-3xl' : 'text-lg'} font-serif text-[var(--text-main)] mb-2`}>
        Finde Momente der Stille in deiner Inbox
      </h2>
      <p className="text-[var(--text-muted)] text-sm mb-6 max-w-lg mx-auto leading-relaxed">
        {isProminent
          ? "Erhalte sanfte Impulse, Tipps für Achtsamkeit und exklusive Einblicke – direkt in dein Postfach."
          : "Monatliche Impulse für mehr Ruhe."
        }
      </p>

      <form
        onSubmit={handleSubmit}
        className={`${isProminent ? 'flex flex-col gap-3 max-w-sm mx-auto' : 'flex flex-col sm:flex-row gap-3'} mt-2`}
      >
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine.email@beispiel.de"
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[var(--accent)] text-white text-sm font-medium rounded-2xl hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Anmelden...</span>
            </>
          ) : (
            <>
              <Mail size={16} />
              <span>Anmelden</span>
            </>
          )}
        </button>
      </form>

      {errorMessage && (
        <p className="mt-3 text-xs text-red-600 font-medium text-center">{errorMessage}</p>
      )}
    </div>
  );
}
