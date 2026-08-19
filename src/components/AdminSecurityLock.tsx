import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Fingerprint, Lock, KeyRound, AlertCircle, 
  ArrowRight, Loader2, RefreshCw, Smartphone, Key
} from 'lucide-react';
import { isBiometricSupported, verifyWithBiometrics, verifyAdminPin } from '../lib/adminSecurity';

interface AdminSecurityLockProps {
  onUnlock: () => void;
  adminName?: string;
}

export function AdminSecurityLock({ onUnlock, adminName }: AdminSecurityLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loadingBiometrics, setLoadingBiometrics] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    isBiometricSupported().then(supported => {
      setBiometricsAvailable(supported);
    });
  }, []);

  const handleBiometricUnlock = async () => {
    setError('');
    setLoadingBiometrics(true);
    try {
      const result = await verifyWithBiometrics();
      if (result.success) {
        onUnlock();
      } else {
        // Fallback auf PIN
        setError('Biometrie nicht bestätigt. Bitte verwende deine Sicherheits-PIN.');
      }
    } catch (err: any) {
      setError('Biometrie abgebrochen. Bitte PIN eingeben.');
    } finally {
      setLoadingBiometrics(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verifyAdminPin(pin)) {
      onUnlock();
    } else {
      setError('Falsche Sicherheits-PIN. Bitte versuche es erneut.');
      setPin('');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--accent)]/30 shadow-2xl text-center relative overflow-hidden font-sans">
      {/* Glow Deko */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--accent)]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Lock size={30} />
      </div>

      <h2 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-1">
        Admin-Sicherheitsprüfung 🔐
      </h2>
      <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
        Hallo {adminName ? <strong>{adminName}</strong> : 'Admin'}! Dieser Bereich enthält sensible Nutzerdaten. Bitte bestätige kurz deine Identität.
      </p>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 rounded-2xl border border-red-200 dark:border-red-800/50 text-xs flex items-center gap-2 shadow-xs text-left"
        >
          <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Biometrie Button (Fingerabdruck / Face ID) */}
      {biometricsAvailable && (
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBiometricUnlock}
            disabled={loadingBiometrics}
            className="w-full py-4 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {loadingBiometrics ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Sensoren prüfen...</span>
              </>
            ) : (
              <>
                <Fingerprint size={22} />
                <span>Mit Fingerabdruck / Face ID entsperren</span>
              </>
            )}
          </button>

          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-[var(--border)] w-full" />
            <span className="bg-[var(--bg-card)] px-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold absolute">
              oder per PIN
            </span>
          </div>
        </div>
      )}

      {/* PIN Eingabeformular */}
      <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider text-center">
            6-stellige Admin-Sicherheits-PIN
          </label>
          <div className="relative">
            <input
              type="password"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              autoFocus
              className="w-full py-3.5 px-4 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-center text-xl tracking-widest font-mono text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
              required
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] text-center mt-1.5">
            Standard-Team-PIN: <code className="bg-[var(--bg-alt)] px-1.5 py-0.5 rounded font-mono">741852</code>
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-3"
        >
          <Key size={16} />
          <span>Admin-Bereich entsperren</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
