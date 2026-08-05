import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, CheckCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { getSupabase, normalizeEmail } from '../lib/supabaseClient';
import { subscribeToNewsletter } from '../lib/newsletterService';
import SEO from '../components/SEO';
import { checkConsentForAuth } from '../components/CookieBanner';

export default function Register() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    checkConsentForAuth();
  }, []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
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
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            newsletter_optin: newsletter,
          }
        }
      });

      if (supabaseError) {
        setError(supabaseError.message);
        // Tracking: Registrierungsfehler erfassen für Looker Studio
        dataLayer.push({
          event: 'registration_status',
          status: 'error',
          error_message: supabaseError.message
        });
        return;
      }

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
            source: 'registration_form',
            updated_at: new Date().toISOString()
          });

        if (!dbError) {
          // B: Edge Function für DOI Mail aufrufen
          const { error: edgeError } = await supabase.functions.invoke('send-double-opt-in-email', {
            body: { email: normalizedEmail, confirm_token: confirmToken }
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

      // Tracking: Erfolgreiche Registrierung senden
      dataLayer.push({
        event: 'registration_status',
        status: 'success',
        user_id: data?.user?.id || 'unknown'
      });

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
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)] opacity-60 hover:opacity-100 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-opacity-25"
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
                  className="mt-0.5 w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-opacity-25"
                  required
                />
                <span className="text-xs text-[var(--text-muted)] leading-relaxed select-none group-hover:text-[var(--text-main)] transition-colors">
                  Ich stimme zu, dass meine Angaben und Daten zur Account-Registrierung elektronisch erhoben und gespeichert werden. Ich habe die <Link to="/datenschutz" className="text-[var(--accent)] underline font-medium hover:text-[var(--accent-hover)]">Datenschutzerklärung</Link> gelesen und akzeptiert. *
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !dsgvo}
            className="w-full py-4 flex items-center justify-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Bitte warten...' : 'Registrieren'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
          Hast du bereits ein Konto?{' '}
          <Link to="/login" className="text-[var(--accent)] font-medium hover:underline">
            Hier einloggen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}