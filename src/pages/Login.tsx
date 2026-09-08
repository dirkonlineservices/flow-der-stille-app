import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import { getSupabase, normalizeEmail } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import { checkConsentForAuth } from '../components/CookieBanner';

function getFriendlyErrorMessage(rawError: string) {
  const lower = rawError.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials') || lower.includes('wrong password') || lower.includes('invalid email')) {
    return {
      title: "Hattest du nicht genügend Ruhe beim Einloggen? 🧘‍♂️",
      description: "Deine E-Mail-Adresse oder dein Passwort scheint nicht ganz zu stimmen. Bitte überprüfe kurz die Schreibweise oder ob sich ein Tippfehler eingeschlichen hat.",
      showRegisterLink: true
    };
  }
  if (lower.includes('user not found') || lower.includes('email not found')) {
    return {
      title: "Deine E-Mail ist uns noch nicht bekannt 🌿",
      description: "Es sieht so aus, als ob diese E-Mail-Adresse bei uns noch kein Konto hat. Prüfe bitte die Schreibweise oder erstelle dir einfach einen kostenlosen Account.",
      showRegisterLink: true
    };
  }
  if (lower.includes('email not confirmed')) {
    return {
      title: "Bestätige bitte kurz deine E-Mail-Adresse 📧",
      description: "Wir haben dir einen Bestätigungslink per E-Mail geschickt. Bitte klicke darauf, um dich einzuloggen.",
      showRegisterLink: false
    };
  }
  return {
    title: "Ein kleiner Moment der Unruhe 🌿",
    description: rawError || "Bitte überprüfe deine Daten und versuche es noch einmal.",
    showRegisterLink: true
  };
}

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    checkConsentForAuth();
    const redirectParam = searchParams.get('redirectTo') || location.state?.from;
    if (redirectParam) {
      sessionStorage.setItem('auth_return_url', redirectParam);
    }
  }, [searchParams, location]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    // GTM DataLayer: Login-Versuch tracken
    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({ event: 'login_attempt' });

    try {
      const supabase = getSupabase();
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password: password,
      });

      if (supabaseError) {
        setError(supabaseError.message);
        // Tracking: Fehlgeschlagener Login
        dataLayer.push({
          event: 'login_status',
          status: 'error',
          error_message: supabaseError.message
        });
        return;
      }

      // Tracking: Erfolgreicher Login
      dataLayer.push({
        event: 'login_status',
        status: 'success',
        user_id: data?.user?.id || 'unknown'
      });

      // Dynamische Weiterleitung: Zurück zur ursprünglichen Stelle oder zum persönlichen Dashboard
      const returnUrl = location.state?.from || searchParams.get('redirectTo') || sessionStorage.getItem('auth_return_url') || '/dashboard';
      sessionStorage.removeItem('auth_return_url');
      navigate(returnUrl, { replace: true });
    } catch (err) {
      const fallbackMsg = 'Ein unerwarteter Fehler ist aufgetreten.';
      setError(fallbackMsg);
      dataLayer.push({
        event: 'login_status',
        status: 'error',
        error_message: fallbackMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setError('');
    setLoading(true);

    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({ event: 'login_attempt', method: 'google_sso' });

    try {
      const supabase = getSupabase();
      const isNative = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
      const returnUrl = location.state?.from || searchParams.get('redirectTo') || sessionStorage.getItem('auth_return_url') || '/dashboard';
      sessionStorage.setItem('auth_return_url', returnUrl);

      const redirectTo = isNative
        ? 'app.flowderstille.de://auth/callback'
        : `${window.location.origin}/auth/callback`;

      const { error: ssoError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (ssoError) throw ssoError;
    } catch (err: any) {
      setError(err.message || 'Google-Anmeldung konnte nicht gestartet werden.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 bg-[var(--bg-main)]">
      <SEO title="Einloggen" description="Melde dich bei deinem Flow der Stille Account an." />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[var(--text-main)] mb-2">Willkommen zurück</h2>
          <p className="text-[var(--text-muted)] text-sm">Tritt ein in deinen Raum der Stille.</p>
        </div>

        {error && (() => {
          const friendly = getFriendlyErrorMessage(error);
          return (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 mb-6 bg-[var(--bg-alt)] border border-[#E5DEC9] dark:border-[#3D3830] rounded-2xl shadow-sm text-sm text-[var(--text-main)]"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#EFE7DA] dark:bg-[#38332B] text-[#8A9A8A] shrink-0 mt-0.5 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-semibold text-base font-serif text-[var(--text-main)] leading-snug">
                    {friendly.title}
                  </h4>
                  <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                    {friendly.description}
                  </p>
                  {friendly.showRegisterLink && (
                    <div className="pt-2">
                      <Link to="/register" className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A9A8A] hover:text-[#728372] hover:underline">
                        Noch keinen Account? Hier kostenfrei registrieren →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}

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
                /* Tailwind JIT Fix: Placeholder Farbe als Hex erzwungen */
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[#8A9A8A] outline-none transition-all text-sm text-[var(--text-main)] placeholder-[#695C4D]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Passwort</label>
              <Link to="/forgot-password" className="text-xs font-medium text-[#8A9A8A] hover:text-[#728372] hover:underline">
                Passwort vergessen?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                /* Tailwind JIT Fix: Placeholder Farbe als Hex erzwungen */
                className="w-full pl-11 pr-12 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[#8A9A8A] outline-none transition-all text-sm text-[var(--text-main)] placeholder-[#695C4D]"
                required
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

          <button
            id="login_submit_btn"
            type="submit"
            disabled={loading}
            onClick={() => {
              const dataLayer = (window as any).dataLayer || [];
              dataLayer.push({ event: 'login', method: 'email' });
            }}
            /* Hoher Kontrast mit sattem Waldgrün */
            className="w-full py-4 flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Prüfe Daten...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={18} />
                Einloggen
              </span>
            )}
          </button>
        </form>

        {/* Trenner ODER */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <span className="relative px-3 bg-[var(--bg-card)] text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            oder
          </span>
        </div>

        {/* Google SSO Button mit Hybrid-Datenschutzhinweis */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border-2 border-[var(--border)] rounded-full font-semibold text-sm transition-all shadow-2xs active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Mit Google anmelden</span>
          </button>

          <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed px-2">
            Mit der Google-Anmeldung stimmst du unserer{' '}
            <Link to="/datenschutz" className="underline hover:text-[var(--text-main)]">
              Datenschutzerklärung
            </Link>{' '}
            und dem{' '}
            <Link to="/rechtliches" className="underline hover:text-[var(--text-main)]">
              Haftungsausschluss für Meditation &amp; Selbsthypnose
            </Link>{' '}
            zu.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
          Neu bei Flow der Stille?{' '}
          <Link to="/register" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
            Konto erstellen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}