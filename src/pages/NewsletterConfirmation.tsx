import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, Mail, Heart, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { getSupabase, normalizeEmail } from '../lib/supabaseClient';
import SEO from '../components/SEO';

export default function NewsletterConfirmation() {
  const [searchParams] = useSearchParams();
  const urlEmail = searchParams.get('email') || '';
  const urlToken = searchParams.get('token') || searchParams.get('confirm_token') || '';

  const [email, setEmail] = useState<string>(urlEmail);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAgreed, setIsAgreed] = useState<boolean>(true);

  useEffect(() => {
    if (urlEmail && !email) {
      setEmail(urlEmail);
    }
  }, [urlEmail]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading || !isAgreed) return;

    setLoading(true);
    setErrorMessage('');

    const normalized = normalizeEmail(email);
    const nowIso = new Date().toISOString();
    const supabase = getSupabase();

    // 1. Write / Update in Supabase newsletter_leads setting status = 'confirmed'
    try {
      const { error: supabaseErr } = await supabase
        .from('newsletter_leads')
        .upsert({
          email: normalized,
          status: 'confirmed',
          confirm_token: null, // token removed upon confirmation
          confirmed_at: nowIso,
          updated_at: nowIso,
          source: 'landing_page_confirmation'
        }, { onConflict: 'email' });

      if (supabaseErr) {
        console.warn('Supabase confirmation warning:', supabaseErr.message);
      }
    } catch (err) {
      console.warn('Supabase confirmation caught exception:', err);
    }

    // 2. Also notify backend API (SQLite)
    try {
      await fetch('/api/newsletter/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalized,
          token: urlToken
        })
      });
    } catch (err) {
      console.warn('Local API confirmation warning:', err);
    }

    // 3. Complete state transition
    setLoading(false);
    setConfirmedEmail(normalized);
    setConfirmed(true);

    // 4. Trigger conversion tracking event
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'newsletter_doi_success',
        email: normalized,
        timestamp: nowIso
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 bg-[var(--color-bg-body,var(--bg-main,#F7F6F2))] text-[var(--color-text-main,var(--text-main,#3D3B35))]">
      <SEO 
        title="Newsletter-Bestätigung" 
        description="Bestätige deine Newsletter-Anmeldung bei Flow der Stille für regelmäßige Impulse zur inneren Ruhe." 
      />

      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-[var(--color-bg-card,var(--bg-card,#FFFFFF))] rounded-3xl p-8 sm:p-12 shadow-sm border border-[var(--color-border-main,var(--border,#E3E1D9))] text-center relative overflow-hidden"
        >
          {/* Subtle background gradient highlight */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[var(--color-accent-primary,var(--accent,#8A9A8A))] opacity-10 blur-2xl pointer-events-none" />

          {confirmed ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-inner">
                <CheckCircle2 size={42} className="stroke-[2.2]" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-bg-alt,var(--bg-alt,#F7F6F2))] text-[var(--color-accent-primary,var(--accent,#8A9A8A))] uppercase tracking-wider mb-3">
                  <Sparkles size={13} />
                  Bestätigt
                </span>
                <h1 className="text-3xl font-serif text-[var(--color-text-main,var(--text-main,#3D3B35))] mb-3">
                  Willkommen im Flow der Stille!
                </h1>
                <p className="text-[var(--color-text-muted,var(--text-muted,#78716C))] text-base leading-relaxed max-w-md mx-auto">
                  Wurde erfolgreich bestätigt.
                </p>
              </div>

              {/* Expectations / Benefits box */}
              <div className="bg-[var(--color-bg-alt,var(--bg-alt,#F7F6F2))] p-6 rounded-2xl border border-[var(--color-border-main,var(--border,#E3E1D9))] text-left space-y-3">
                <h2 className="text-xs font-semibold text-[var(--color-text-muted,var(--text-muted,#78716C))] uppercase tracking-wider mb-1">
                  Was dich ab sofort erwartet:
                </h2>
                <div className="flex items-start gap-3 text-sm text-[var(--color-text-main,var(--text-main,#3D3B35))]">
                  <Heart size={18} className="text-[var(--color-accent-primary,var(--accent,#8A9A8A))] shrink-0 mt-0.5" />
                  <span>Achtsamkeitsimpulse & Atemübungen zur Beruhigung deines Nervensystems.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[var(--color-text-main,var(--text-main,#3D3B35))]">
                  <Mail size={18} className="text-[var(--color-accent-primary,var(--accent,#8A9A8A))] shrink-0 mt-0.5" />
                  <span>Monatliche Inspirationen & Ankündigungen für exklusive Inhalte.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[var(--color-text-main,var(--text-main,#3D3B35))]">
                  <ShieldCheck size={18} className="text-[var(--color-accent-primary,var(--accent,#8A9A8A))] shrink-0 mt-0.5" />
                  <span>Maximaler Datenschutz – du kannst dich jederzeit mit einem Klick abmelden.</span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3.5 bg-[var(--color-accent-primary,var(--accent,#8A9A8A))] hover:bg-[var(--color-accent-hover,#788878)] text-white text-sm font-medium rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Zur Startseite</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/exercises"
                  className="px-6 py-3.5 bg-[var(--color-bg-alt,var(--bg-alt,#F7F6F2))] hover:bg-[var(--color-border-main,var(--border,#E3E1D9))] text-[var(--color-text-main,var(--text-main,#3D3B35))] text-sm font-medium rounded-2xl transition-all flex items-center justify-center border border-[var(--color-border-main,var(--border,#E3E1D9))]"
                >
                  Übungen erkunden
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-[var(--color-bg-alt,var(--bg-alt,#F7F6F2))] text-[var(--color-accent-primary,var(--accent,#8A9A8A))] flex items-center justify-center">
                <Mail size={32} />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-bg-alt,var(--bg-alt,#F7F6F2))] text-[var(--color-accent-primary,var(--accent,#8A9A8A))] uppercase tracking-wider mb-2">
                  Fast geschafft
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif text-[var(--color-text-main,var(--text-main,#3D3B35))] mb-2">
                  Newsletter-Anmeldung bestätigen
                </h1>
                <p className="text-[var(--color-text-muted,var(--text-muted,#78716C))] text-sm leading-relaxed max-w-md mx-auto">
                  Bitte bestätige deine Anmeldung, um die regelmäßigen Impulse per E-Mail zu erhalten.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs text-left border border-red-200">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleConfirm} className="space-y-5 max-w-md mx-auto text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted,var(--text-muted,#78716C))] uppercase tracking-wider mb-2">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine.email@beispiel.de"
                    className="w-full px-4 py-3 bg-[var(--color-bg-body,var(--bg-main,#F7F6F2))] border border-[var(--color-border-main,var(--border,#E3E1D9))] rounded-2xl focus:ring-2 focus:ring-[var(--color-accent-primary,var(--accent,#8A9A8A))] outline-none text-sm text-[var(--color-text-main,var(--text-main,#3D3B35))]"
                    required
                  />
                </div>

                {/* Confirmation phrase checkbox card */}
                <div 
                  onClick={() => setIsAgreed(!isAgreed)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isAgreed 
                      ? 'bg-[var(--color-bg-alt,var(--bg-alt,#F7F6F2))] border-[var(--color-accent-primary,var(--accent,#8A9A8A))]' 
                      : 'bg-[var(--color-bg-card,var(--bg-card,#FFFFFF))] border-[var(--color-border-main,var(--border,#E3E1D9))]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-[var(--color-accent-primary,var(--accent,#8A9A8A))] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-[var(--color-text-main,var(--text-main,#3D3B35))] leading-relaxed">
                    Ich bestätige, dass ich mich mit der E-Mail-Adresse <strong className="font-medium underline decoration-dotted">{email || 'meine-email@beispiel.de'}</strong> für den Newsletter anmelden möchte.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !isAgreed}
                  className="w-full py-4 bg-[var(--color-accent-primary,var(--accent,#8A9A8A))] hover:bg-[var(--color-accent-hover,#788878)] text-white text-sm font-semibold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Bestätigung wird gespeichert...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Newsletter-Anmeldung jetzt bestätigen</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
