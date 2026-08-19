import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Recovery-Token / PKCE-Code oder Session beim Aufruf prüfen
  useEffect(() => {
    const checkRecoverySession = async () => {
      setSessionChecking(true);
      const supabase = getSupabase();

      try {
        // A: Prüfen ob ein PKCE 'code' Parameter in der URL übergeben wurde
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('PKCE exchange warning:', exchangeError.message);
          }
        }

        // B: Prüfen ob eine gültige Session (aus Recovery-Link oder Hash) vorliegt
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session && !sessionError) {
          setHasValidSession(true);
        } else {
          // Eventuell auf Auth-State-Change warten (bei Hash-basierten Recovery-Links)
          const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && newSession)) {
              setHasValidSession(true);
              setSessionChecking(false);
            }
          });

          // Kurzer Timeout für Hash-Parsing
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              setHasValidSession(true);
            }
            setSessionChecking(false);
          }, 1000);

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error('Session check exception:', err);
      } finally {
        setSessionChecking(false);
      }
    };

    checkRecoverySession();
  }, [searchParams]);

  // 2. Neues Passwort speichern & mit der Datenbank abgleichen
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Die eingegebenen Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      // Passwort in Supabase Auth aktualisieren
      const { data, error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (updateError) {
        throw updateError;
      }

      if (!data?.user) {
        throw new Error('Passwort konnte nicht aktualisiert werden. Bitte fordere einen neuen Link an.');
      }

      // Tracking
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'password_reset_success' });
      }

      // WICHTIG: Den temporären Recovery-Login beenden, damit der Nutzer sich
      // mit seinem neuen Passwort regulär über die Anmeldemaske authentifiziert.
      await supabase.auth.signOut();
      localStorage.removeItem('flow-der-stille-auth');

      setSuccess(true);
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren des Passworts:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Ladeanzeige bei initialer Session-Prüfung
  if (sessionChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-[var(--bg-main)]">
        <SEO title="Passwort zurücksetzen" description="Lege dein neues Passwort fest." />
        <div className="w-full max-w-md bg-[var(--bg-card)] p-8 rounded-3xl shadow-md border border-[var(--border)] text-center">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Sicherheitsprüfung läuft...</p>
        </div>
      </div>
    );
  }

  // Erfolgsanzeige nach erfolgreichem Reset
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-[var(--bg-main)]">
        <SEO title="Passwort geändert" description="Dein neues Passwort wurde erfolgreich gespeichert." />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)] text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-3">Passwort erfolgreich geändert! 🎉</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
            Dein neues Passwort ist ab sofort aktiv. Bitte melde dich jetzt mit deiner E-Mail und deinem neuen Passwort an.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl text-sm transition-all shadow-md active:scale-98"
          >
            <span>Jetzt anmelden →</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Link ungültig oder abgelaufen (keine gültige Recovery-Session)
  if (!hasValidSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-[var(--bg-main)]">
        <SEO title="Link abgelaufen" description="Der Link zum Zurücksetzen des Passworts ist abgelaufen." />
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)] text-center"
        >
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200 dark:border-amber-800/40 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-3">Link abgelaufen oder ungültig</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
            Der Link zum Zurücksetzen deines Passworts ist leider nicht mehr gültig oder wurde bereits verwendet. Bitte fordere einen neuen Link an.
          </p>
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl text-sm transition-all shadow-md active:scale-98"
            >
              <span>Neuen Link anfordern</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Zurück zum Login</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Reguläres Formular zum Setzen des neuen Passworts
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 bg-[var(--bg-main)] font-sans">
      <SEO title="Neues Passwort setzen" description="Lege dein neues Passwort fest." />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)]"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] mb-2">Neues Passwort festlegen</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Gib dein neues, sicheres Passwort für deinen Account ein.</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Neues Passwort (mind. 6 Zeichen)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(prev => !prev);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-70 hover:opacity-100 focus:outline-none z-20 cursor-pointer transition-all"
                tabIndex={-1}
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Passwort bestätigen
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                <Lock size={16} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmPassword(prev => !prev);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-70 hover:opacity-100 focus:outline-none z-20 cursor-pointer transition-all"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                title={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                <span>Passwort wird gespeichert...</span>
              </>
            ) : (
              <span>Passwort jetzt speichern</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          <Link to="/login" className="hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1 font-medium">
            <ArrowLeft size={12} />
            <span>Zurück zum Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
