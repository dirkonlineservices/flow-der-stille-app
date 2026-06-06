import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-stone-100">
        <h2 className="text-3xl font-serif text-[var(--color-accent-olive)] mb-6 text-center">{t('auth.register')}</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">{t('auth.username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[var(--color-accent-olive)] text-white rounded-xl font-medium hover:bg-[var(--color-accent-olive-hover)] transition-colors"
          >
            {t('auth.submit')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account? <Link to="/login" className="text-[var(--color-accent-olive)] hover:underline">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
}
