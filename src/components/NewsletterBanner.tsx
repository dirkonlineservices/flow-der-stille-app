import { useState } from 'react';

interface NewsletterBannerProps {
  variant: 'prominent' | 'in-content';
}

export default function NewsletterBanner({ variant }: NewsletterBannerProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'generate_lead',
        form_location: variant
      });
    }
    // Handle submission (e.g., API call)
    console.log(`Subscribed: ${email}`);
    setEmail('');
  };

  const isProminent = variant === 'prominent';

  return (
    <div className={`
      ${isProminent
        ? 'p-8 md:p-12 bg-[var(--color-bg-alt)] rounded-2xl text-center shadow-sm'
        : 'p-6 border border-[var(--color-border-main)] rounded-2xl bg-[var(--color-bg-card)]'
      }
      transition-all duration-300
    `}>
      <h2 className={`${isProminent ? 'text-3xl' : 'text-lg'} font-serif text-[var(--color-text-main)] mb-2`}>
        Finde Momente der Stille in deiner Inbox
      </h2>
      <p className="text-[var(--color-text-muted)] text-sm mb-6">
        {isProminent 
          ? "Erhalte sanfte Impulse, Tipps für Achtsamkeit und exklusive Einblicke – direkt in dein Postfach."
          : "Monatliche Impulse für mehr Ruhe."
        }
      </p>

      <form
        onSubmit={handleSubmit}
        className={`${isProminent ? 'flex flex-col gap-3 max-w-sm mx-auto' : 'flex flex-col sm:flex-row gap-3'} mt-2`}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail-Adresse"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] bg-[var(--color-bg-body)] text-[var(--color-text-main)] text-sm"
          required
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-[var(--color-accent-primary)] text-white text-sm font-medium rounded-xl hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Anmelden
        </button>
      </form>
    </div>
  );
}
