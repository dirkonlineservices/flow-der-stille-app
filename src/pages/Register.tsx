import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, CheckCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

export default function Register() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [dsgvo, setDsgvo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // NEU: Wir merken uns, ob die Registrierung erfolgreich war, 
  // aber die E-Mail noch bestätigt werden muss.
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign Up
      const supabase = getSupabase();
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: email,
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
        return;
      }

      // If signup successful, handle newsletter
      if (data?.user && newsletter) {
        // 2. Newsletter (Non-blocking)
        try {
          const { data: newsletterData, error: insertError } = await supabase
            .from('newsletter_leads')
            .insert([{ 
                email: email,
                source: 'app_registration' 
                // status und confirm_token werden durch die DB-Defaults automatisch gesetzt!
            }])
            .select();

          if (!insertError && newsletterData && newsletterData.length > 0) {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({ event: 'newsletter_signup_success', user_id: data.user.id });
          } else {
            console.error("Newsletter error:", insertError);
          }
        } catch (newsletterErr) {
          // Log, but do not stop signup
          console.error("Newsletter exception:", newsletterErr);
        }
      }

      // Success
      setIsSubmitted(true);
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  // Wenn die Daten gesendet wurden, zeigen wir nur noch diesen Hinweis:
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
        <SEO title="Registrieren" description="Erstellen Sie einen kostenlosen Account bei Flow der Stille." />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-[var(--color-bg-card)] p-8 md:p-10 rounded-3xl shadow-lg border border-[var(--color-border-main)] text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Mail size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-serif text-[var(--color-accent-primary)] mb-4">Fast geschafft!</h2>
          <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
            Wir haben eine Bestätigungsmail an <strong className="text-[var(--color-text-main)]">{email}</strong> gesendet. 
            Bitte klicken Sie auf den Link in dieser E-Mail, um Ihren Account zu aktivieren und sich einzuloggen.
          </p>
          <div className="pt-6 border-t border-[var(--color-border-main)]">
            <p className="text-sm text-[var(--color-text-muted)] mb-4">E-Mail nicht gefunden? Prüfen Sie auch Ihren Spam-Ordner.</p>
            <Link to="/login" className="inline-block py-3 px-6 bg-[var(--color-bg-border)] hover:bg-stone-200 text-[var(--color-text-main)] rounded-xl font-medium transition-colors">
              Zurück zum Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Hier kommt das ganz normale Formular (wird nur angezeigt, solange isSubmitted = false ist)
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <SEO title="Registrieren" description="Erstellen Sie einen kostenlosen Account bei Flow der Stille." />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-[var(--color-bg-card)] p-8 md:p-10 rounded-3xl shadow-lg border border-[var(--color-border-main)]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[var(--color-accent-primary)] mb-2">Account erstellen</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Registrieren Sie sich für Ihren persönlichen Ruhebereich.</p>
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
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Vorname *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--color-text-muted-light)]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--color-bg-alt)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Zuname *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--color-text-muted-light)]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--color-bg-alt)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">E-Mail-Adresse *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--color-text-muted-light)]">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beispiel@domain.de"
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--color-bg-alt)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Sicheres Passwort *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--color-text-muted-light)]">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-[var(--color-bg-alt)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none transition-all text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--color-text-muted-light)] hover:text-[var(--color-text-muted)] focus:outline-none focus:ring-0"
                tabIndex={-1}
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* DSGVO & Newsletter Checkboxen */}
          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-[var(--color-border-main)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)] focus:ring-opacity-25"
              />
              <span className="text-sm text-[var(--color-text-muted)] leading-relaxed select-none group-hover:text-[var(--color-text-main)] transition-colors">
                Ja, ich möchte gelegentlich Impulse für mehr innere Ruhe per E-Mail erhalten.
              </span>
            </label>

            <div className="bg-[var(--color-bg-alt)] p-4 rounded-xl border border-[var(--color-border-main)]">
              <div className="text-sm font-medium text-[var(--color-text-main)] mb-2">DSGVO-konforme Verarbeitung</div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={dsgvo}
                  onChange={(e) => setDsgvo(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-[var(--color-border-main)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)] focus:ring-opacity-25"
                  required
                />
                <span className="text-xs text-[var(--color-text-muted)] leading-relaxed select-none group-hover:text-[var(--color-text-main)] transition-colors">
                  Ich stimme zu, dass meine Angaben und Daten zur Account-Registrierung und zur Bereitstellung der App-Funktionen elektronisch erhoben, verarbeitet und in einer sicheren Datenbank gespeichert werden. Ich habe die <Link to="/datenschutz" className="text-[var(--color-accent-primary)] underline font-medium hover:text-[var(--color-accent-hover)]">Datenschutzerklärung</Link> gelesen und akzeptiert. *
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !dsgvo}
            className="w-full py-4 flex items-center justify-center bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-full font-medium transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Bitte warten...' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--color-border-main)] text-center text-sm text-[var(--color-text-muted)]">
          Haben Sie bereits ein Konto?{' '}
          <Link to="/login" className="text-[var(--color-accent-primary)] font-medium hover:underline">
            Hier einloggen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}