import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import { Eye, EyeOff } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabase();
      const { error: updateError } = await supabase.auth.updateUser({ password: password });

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();
      alert('Passwort erfolgreich aktualisiert. Bitte melden Sie sich mit Ihrem neuen Passwort an.');
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <SEO title="Neues Passwort" description="Legen Sie Ihr neues Passwort fest." />
      <div className="w-full max-w-md bg-[var(--color-bg-card)] p-8 rounded-3xl shadow-lg border border-[var(--color-border-main)]">
        <h2 className="text-3xl font-serif text-[var(--color-accent-primary)] mb-6 text-center">Neues Passwort</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Neues Passwort</label>
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
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 flex items-center justify-center bg-[var(--color-accent-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Speichere...' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}
