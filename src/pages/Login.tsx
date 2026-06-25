import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Lock, ShieldAlert, Eye, EyeOff, LogIn } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
        email: email,
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

      // Weiterleitung zum aktualisierten Dashboard
      navigate('/premium-dashboard');
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
      <SEO title="Einloggen" description="Melden Sie sich bei Ihrem Flow der Stille Account an." />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-[var(--bg-card)] p-8 md:p-10 rounded-3xl shadow-md border border-[var(--border)]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[var(--text-main)] mb-2">Willkommen zurück</h2>
          <p className="text-[var(--text-muted)] text-sm">Treten Sie ein in Ihren Raum der Stille.</p>
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
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-sm text-[var(--text-main)]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Passwort</label>
              <Link to="/forgot-password" className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 flex items-center justify-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
          <Link to="/register" className="text-[var(--accent)] font-medium hover:underline">
            Konto erstellen
          </Link>
        </div>
      </motion.div>
    </div>
  );
}