import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, CheckCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabase'; // <-- NEU: Unsere Datenbank-Brücke

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // <-- NEU: Der direkte Aufruf an deine Supabase-Datenbank
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
        // Gibt die direkte Fehlermeldung von Supabase aus (z.B. Passwort zu kurz)
        setError(supabaseError.message);
        return;
      }

      if (data?.user) {
        // Erfolgreich registriert! Nutzer wird eingeloggt und weitergeleitet.
        login({
          id: data.user.id,
          email: data.user.email || '',
          first_name: firstName,
          last_name: lastName,
          is_premium: false,
          newsletter_optin: newsletter,
          purchased_products: []
        });
        navigate('/');
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-stone-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[var(--color-accent-olive)] mb-2">Account erstellen</h2>
          <p className="text-stone-500 text-sm">Registrieren Sie sich für Ihren persönlichen Ruhebereich.</p>
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
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Vorname *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  className="w-full pl-11 pr-4 py-3.5 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Zuname *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  className="w-full pl-11 pr-4 py-3.5 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">E-Mail-Adresse *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beispiel@domain.de"
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Sicheres Passwort *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* DSGVO & Newsletter Checkboxen */}
          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-olive)] focus:ring-[var(--color-accent-olive)] focus:ring-opacity-25"
              />
              <span className="text-xs text-stone-600 leading-relaxed select-none group-hover:text-stone-800 transition-colors">
                Ja, ich möchte mich für den kostenlosen Newsletter von <strong className="text-[var(--color-accent-olive)]">Flow der Stille</strong> anmelden. Ich erhalte einmal im Monat wertvolle, exklusive Tipps zum Stressabbau, Achtsamkeitsimpulse und Angebote. (Jederzeit abbestellbar)
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={dsgvo}
                onChange={(e) => setDsgvo(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-olive)] focus:ring-[var(--color-accent-olive)] focus:ring-opacity-25"
                required
              />
              <span className="text-xs text-stone-500 leading-relaxed select-none group-hover:text-stone-700 transition-colors">
                Ich stimme zu, dass meine Angaben und Daten zur Account-Registrierung und zur Bereitstellung der App-Funktionen elektronisch erhoben, verarbeitet und in einer sicheren, DSGVO-konformen Datenbank gespeichert werden. Ich habe die <Link to="/datenschutz" className="text-[var(--color-accent-olive)] underline font-medium">Datenschutzerklärung</Link> gelesen und akzeptiert. *
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !dsgvo}
            className="w-full py-4 bg-[var(--color-accent-olive)] hover:bg-[var(--color-accent-olive-hover)] text-white rounded-2xl font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Konto wird erstellt...' : 'DSGVO-konform registrieren'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-500">
          Haben Sie bereits ein Konto?{' '}
          <Link to="/login" className="text-[var(--color-accent-olive)] font-medium hover:underline">
            Hier einloggen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}