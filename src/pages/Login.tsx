import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getSupabase } from '../lib/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const supabase = getSupabase();
      // Direkter Abgleich mit der Supabase-Datenbank
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (supabaseError) {
        setError(supabaseError.message === 'Invalid login credentials' ? 'Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.' : supabaseError.message);
        return;
      }

      if (data?.user) {
        navigate('/');
      }
    } catch (err) {
      setError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <SEO title="Anmelden" description="Melden Sie sich an, um Ihre Fortschritte zu speichern." />
      <div className="w-full max-w-md bg-[var(--color-bg-card)] p-8 rounded-3xl shadow-lg border border-[var(--color-border-main)]">
        <h2 className="text-3xl font-serif text-[var(--color-accent-primary)] mb-6 text-center">{t('auth.login')}</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">E-Mail-Adresse</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="beispiel@domain.de"
              className="w-full p-3 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">{t('auth.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none"
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
          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center bg-[var(--color-accent-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {t('auth.submit')}
          </button>
          <div className="text-center mt-2">
            <Link to="/forgot-password" className="text-sm text-[var(--color-accent-primary)] hover:underline">
              Passwort vergessen?
            </Link>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          Noch keinen Account? <Link to="/register" className="text-[var(--color-accent-primary)] hover:underline">Hier registrieren</Link>
        </p>
      </div>
    </div>
  );
}