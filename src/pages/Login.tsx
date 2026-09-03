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
            /* Tailwind JIT Fix: Harte Hex-Codes für bg, hover und text */
            className="w-full py-4 flex items-center justify-center bg-[#8A9A8A] hover:bg-[#728372] text-white rounded-full font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
          Neu bei Flow der Stille?{' '}
          <Link to="/register" className="text-[#8A9A8A] font-medium hover:underline">
            Konto erstellen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}