import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setMessage('Eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts wurde gesendet.');
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <SEO title="Passwort vergessen" description="Setzen Sie Ihr Passwort zurück, um sich wieder anzumelden." />
      <div className="w-full max-w-md bg-[var(--color-bg-card)] p-8 rounded-3xl shadow-lg border border-[var(--color-border-main)]">
        <h2 className="text-3xl font-serif text-[var(--color-accent-primary)] mb-6 text-center">Passwort vergessen?</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">E-Mail-Adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beispiel@domain.de"
              className="w-full p-3 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 flex items-center justify-center bg-[var(--color-accent-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Sende...' : 'Passwort zurücksetzen'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          Noch keinen Account? <Link to="/register" className="text-[var(--color-accent-primary)] hover:underline">Hier registrieren</Link>
        </p>
      </div>
    </div>
  );
}
