import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { Mail, Loader2 } from 'lucide-react';

interface NewsletterBannerProps {
  variant: 'prominent' | 'in-content';
}

export default function NewsletterBanner({ variant }: NewsletterBannerProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setErrorMessage('');

    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'generate_lead',
        form_location: variant
      });
    }

    try {
      const result = await subscribeToNewsletter({ email, source: `banner_${variant}` });
      if (result.success) {
        // Redirect customer directly to the confirmation landing page with email in URL
        const redirectUrl = `/newsletter-bestaetigung?email=${encodeURIComponent(email)}`;
        navigate(redirectUrl);
      } else {
        setErrorMessage(result.message || 'Fehler bei der Anmeldung.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unerwarteter Fehler bei der Anmeldung.');
    } finally {
      setLoading(false);
    }
  };

  const isProminent = variant === 'prominent';

  return (
    <div className={`
      ${isProminent
        ? 'p-8 md:p-12 bg-[var(--color-bg-alt,var(--bg-alt,#F7F6F2))] rounded-3xl text-center shadow-sm border border-[var(--color-border-main,var(--border,#E3E1D9))]'
        : 'p-6 border border-[var(--color-border-main,var(--border,#E3E1D9))] rounded-2xl bg-[var(--color-bg-card,var(--bg-card,#FFFFFF))]'
      }
      transition-all duration-300 relative overflow-hidden
    `}>
      <h2 className={`${isProminent ? 'text-2xl md:text-3xl' : 'text-lg'} font-serif text-[var(--color-text-main,var(--text-main,#3D3B35))] mb-2`}>
        Finde Momente der Stille in deiner Inbox
      </h2>
      <p className="text-[var(--color-text-muted,var(--text-muted,#78716C))] text-sm mb-6 max-w-lg mx-auto leading-relaxed">
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
            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border-main,var(--border,#E3E1D9))] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary,var(--accent,#8A9A8A))] bg-[var(--color-bg-body,var(--bg-main,#F7F6F2))] text-[var(--color-text-main,var(--text-main,#3D3B35))] text-sm"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[var(--color-accent-primary,var(--accent,#8A9A8A))] text-white text-sm font-medium rounded-2xl hover:bg-[var(--color-accent-hover,#788878)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
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


