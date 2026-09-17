import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, CheckCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { getSupabase, normalizeEmail } from '../lib/supabaseClient';
import { subscribeToNewsletter } from '../lib/newsletterService';
import SEO from '../components/SEO';
import { checkConsentForAuth } from '../components/CookieBanner';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { trackMetaRegistration, trackMetaLead } from '../lib/metaPixel';

export default function Register() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    checkConsentForAuth();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        localStorage.setItem('flow_referred_by', refParam);
      }
      const redirectParam = params.get('redirectTo') || location.state?.from;
      if (redirectParam) {
        sessionStorage.setItem('auth_return_url', redirectParam);
      }
    }
  }, [searchParams, location]);

  const [firstName, setFirstName] = useState(() => searchParams.get('name') || searchParams.get('firstName') || '');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [dsgvo, setDsgvo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !dsgvo) return;

    setError('');
    setLoading(true);

    // GTM DataLayer-Initialisierung & Initialer Klick-Push (Conversion-Trichter)
    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({ 
      event: 'registration_attempt',
      newsletter_optin: newsletter 
    });

    try {
      const supabase = getSupabase();
      const normalizedEmail = normalizeEmail(email);
      const isNative = typeof window !== 'undefined' && (
        Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
        typeof (window as any).CdvPurchase !== 'undefined'
      );

      const emailRedirectTo = isNative
        ? 'app.flowderstille.de://auth/callback'
        : `${window.location.origin}/auth/callback`;

      const referredBy = (typeof window !== 'undefined') 
        ? (localStorage.getItem('flow_referred_by') || new URLSearchParams(window.location.search).get('ref') || null) 
        : null;

      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          emailRedirectTo: emailRedirectTo,
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            newsletter_optin: newsletter,
            source: isNative ? 'app' : 'web',
            referred_by: referredBy
          }
        }
      });

      if (supabaseError) {
        let msg = supabaseError.message;
        if (msg.includes('Database error saving new user') || msg.includes('unexpected_failure')) {
          msg = 'Fehler beim Anlegen des Benutzerkontos in der Datenbank (Postgres Trigger). Bitte führe das SQL-Skript im Supabase Dashboard aus.';
        } else if (msg.includes('User already registered')) {
          msg = 'Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an.';
        }
        setError(msg);
        // Tracking: Registrierungsfehler erfassen für Looker Studio
        dataLayer.push({
          event: 'registration_status',
          status: 'error',
          error_message: supabaseError.message
        });
        return;
      }

      // Profile in public.profiles anlegen / aktualisieren mit Vor- und Zunamen & Haftungsausschluss-Zeitstempel
      if (data?.user?.id) {
        const nowIso = new Date().toISOString();
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: normalizedEmail,
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            disclaimer_accepted_at: nowIso,
            updated_at: nowIso
          }, { onConflict: 'id' });
        } catch (profileErr) {
          console.warn('Profile upsert warning:', profileErr);
        }
      }

      // Lokale Flags setzen, damit der registrierte Nutzer niemals erneut blockiert wird
      localStorage.setItem('flow_disclaimer_accepted', 'true');
      localStorage.setItem('fds_audio_consent_granted', 'true');

      // 2. Newsletter Logik isoliert ausführen (Nur wenn Checkbox aktiv ist)
      if (newsletter) {
        const confirmToken = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'doi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

        // A: Insert in die Datenbank (newsletter_leads)
        const { error: dbError } = await supabase
          .from('newsletter_leads')
          .insert({
            email: normalizedEmail,
            status: 'pending_doi',
            confirm_token: confirmToken,
            source: isNative ? 'app_registration' : 'registration_form',
            updated_at: new Date().toISOString()
          });

        if (!dbError) {
          // B: Edge Function für DOI Mail aufrufen
          const { error: edgeError } = await supabase.functions.invoke('send-double-opt-in-email', {
            body: { 
              email: normalizedEmail, 
              confirm_token: confirmToken,
              source: isNative ? 'app' : 'web'
            }
          });

          if (edgeError) {
            console.error("Fehler beim DOI E-Mail Versand:", edgeError.message);
          }

          // C: Tracking Hit feuern
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
              event: 'generate_lead',
              lead_source: 'registration_form',
              lead_status: 'pending_doi'
            });
            (window as any).dataLayer.push({ event: 'newsletter_signup_success', user_id: data?.user?.id });
          }
        } else {
          console.error("Fehler beim Newsletter Insert:", dbError.message);
        }
      }

      // Check for referral code in session storage
      const storedRef = sessionStorage.getItem('referral_code');
      if (storedRef) {
        try {
          await supabase.from('referrals').insert({
            referrer_code: storedRef,
            new_user_id: data?.user?.id || null,
            email: normalizedEmail,
            status: 'completed'
          });
        } catch (refErr) {
          console.warn('Referral insert warning:', refErr);
        }

        dataLayer.push({
          event: 'sign_up',
          method: 'email',
          referral_source: 'user_invite'
        });

        sessionStorage.removeItem('referral_code');
      }

      // Tracking: Erfolgreiche Registrierung senden
      dataLayer.push({
        event: 'registration_status',
        status: 'success',
        user_id: data?.user?.id || 'unknown'
      });
      trackMetaRegistration('Email');

      setIsSubmitted(true);
    } catch (err) {
      const fallbackMsg = 'Ein unerwarteter Fehler ist aufgetreten.';
      setError(fallbackMsg);
      dataLayer.push({
        event: 'registration_status',
        status: 'error',
        error_message: fallbackMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (loading) return;
    setError('');
    setLoading(true);

    const dataLayer = (window as any).dataLayer || [];
    dataLayer.push({ event: 'registration_attempt', method: 'google_sso' });

    try {
      const supabase = getSupabase();
      const isNative = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
      const returnUrl = location.state?.from || searchParams.get('redirectTo') || sessionStorage.getItem('auth_return_url') || '/dashboard';
      sessionStorage.setItem('auth_return_url', returnUrl);

      const redirectTo = isNative
        ? 'app.flowderstille.de://auth/callback'
        : `${window.location.origin}/auth/callback`;

      if (isNative) {
        // NATIV (Android App): URL anfordern und im sicheren System-Browser öffnen
        // Verhindert Googles 'disallowed_useragent' Fehler im WebView!
        const { data, error: ssoError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            skipBrowserRedirect: true,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            }
          }
        });

        if (ssoError) throw ssoError;

        if (data?.url) {
          await Browser.open({ url: data.url, windowName: '_system' });
        }
      } else {
        // WEB: Standard Browser-Redirect
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
      }
    } catch (err: any) {
      setError(err.message || 'Google-Registrierung konnte nicht gestartet werden.');
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 bg-[var(--bg-main)]">
        <SEO title="Registrieren" description="Erstelle einen kostenlosen Account bei Flow der Stille." />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)] text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--bg-main)] rounded-full flex items-center justify-center text-[var(--accent)]">
              <Mail size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-serif text-[var(--text-main)] mb-4">Fast geschafft!</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            Wir haben eine Bestätigungsmail an <strong className="text-[var(--text-main)]">{email}</strong> gesendet. 
            Bitte klicke auf den Link in dieser E-Mail, um deinen Account zu aktivieren und dich einzuloggen.
          </p>
          <div className="pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)] mb-4">E-Mail nicht gefunden? Prüfe auch deinen Spam-Ordner.</p>
            <Link to="/login" className="inline-block py-3 px-6 bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] rounded-xl font-medium transition-colors">
              Zurück zum Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 bg-[var(--bg-main)]">
      <SEO title="Registrieren" description="Erstelle einen kostenlosen Account bei Flow der Stille." />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[var(--text-main)] mb-2">Account erstellen</h2>
          <p className="text-[var(--text-muted)] text-sm">Registriere dich für deinen persönlichen Ruhebereich.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl text-red-700 text-sm mb-6 border border-red-100"
          >
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Vorname *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Zuname *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)]"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">E-Mail-Adresse *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beispiel@domain.de"
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Sicheres Passwort *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)] opacity-60">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)]"
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

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-opacity-25 shrink-0"
              />
              <span className="text-sm text-[var(--text-muted)] leading-relaxed select-none group-hover:text-[var(--text-main)] transition-colors">
                Ja, ich möchte gelegentlich Impulse für mehr innere Ruhe per E-Mail erhalten.
              </span>
            </label>

            <div className="bg-[var(--bg-alt)] p-4 rounded-xl border border-[var(--border)]">
              <div className="text-sm font-medium text-[var(--text-main)] mb-2">DSGVO-konforme Verarbeitung</div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={dsgvo}
                  onChange={(e) => setDsgvo(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-opacity-25 shrink-0"
                  required
                />
                <span className="text-xs text-[var(--text-muted)] leading-relaxed select-none group-hover:text-[var(--text-main)] transition-colors">
                  Ich stimme zu, dass meine Angaben und Daten zur Account-Registrierung elektronisch erhoben und gespeichert werden. Ich habe die <Link to="/datenschutz" className="text-[var(--accent)] underline font-medium hover:text-[var(--accent-hover)]">Datenschutzerklärung</Link> gelesen und akzeptiert sowie den <Link to="/rechtliches" className="text-[var(--accent)] underline font-medium hover:text-[var(--accent-hover)]">Haftungsausschluss für Meditation &amp; Selbsthypnose</Link> zur Kenntnis genommen und stimme der Nutzung auf eigene Verantwortung zu. *
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !dsgvo}
            className="w-full py-4 flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
          >
            {loading ? 'Bitte warten...' : 'Konto registrieren'}
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
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border-2 border-[var(--border)] rounded-full font-semibold text-sm transition-all shadow-2xs active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Mit Google registrieren</span>
          </button>

          <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed px-2">
            Mit der Google-Registrierung stimmst du unserer{' '}
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
          Hast du bereits ein Konto?{' '}
          <Link to="/login" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
            Hier einloggen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}