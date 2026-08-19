import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase, normalizeEmail } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const supabase = getSupabase();
      const isNative = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
      const emailRedirectTo = isNative
        ? 'app.flowderstille.de://reset-password'
        : `${window.location.origin}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
        redirectTo: emailRedirectTo,
      });

      if (resetError) {
        throw resetError;
      }

      setMessage('Wir haben dir eine E-Mail mit einem sicheren Link zum Zurücksetzen deines Passworts gesendet. Bitte prüfe dein Postfach (auch den Spam-Ordner).');
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 bg-[var(--bg-main)] font-sans">
      <SEO title="Passwort vergessen" description="Setze dein Passwort zurück, um dich wieder anzumelden." />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)]"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] mb-2">Passwort vergessen?</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Gib deine E-Mail-Adresse ein. Wir senden dir einen Link, mit dem du dein Passwort neu vergeben kannst.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 rounded-2xl border border-red-200 dark:border-red-800/50 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm"
          >
            <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {message ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-center space-y-4 shadow-sm"
          >
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-xs sm:text-sm leading-relaxed">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline pt-2"
            >
              <ArrowLeft size={14} />
              <span>Zurück zum Login</span>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">E-Mail-Adresse</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="beispiel@domain.de"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full font-semibold transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Sende Link...</span>
                </>
              ) : (
                <span>Link zum Zurücksetzen anfordern</span>
              )}
            </button>
          </form>
        )}

        {!message && (
          <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <Link to="/login" className="hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={12} />
              <span>Zurück zum Login</span>
            </Link>
            <Link to="/register" className="text-[var(--accent)] font-semibold hover:underline">
              Neuen Account erstellen →
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
