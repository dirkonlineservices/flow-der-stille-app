import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sparkles, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function NamePromptModal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Nicht anzeigen auf Auth- oder Einstellungs-Seiten
    const quietRoutes = ['/einstellungen', '/settings', '/login', '/register', '/auth/callback', '/reset-password'];
    if (quietRoutes.includes(location.pathname)) {
      setIsOpen(false);
      return;
    }

    // Nur anzeigen, wenn der Nutzer eingeloggt ist, aber KEINEN Vornamen eingetragen hat
    if (user && (!user.first_name || user.first_name.trim() === '')) {
      const dismissed = sessionStorage.getItem('fds_name_prompt_dismissed');
      if (!dismissed) {
        // Sanfter Timer für ein ruhiges Nutzererlebnis (1.2s Verzögerung)
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } else {
      setIsOpen(false);
    }
  }, [user, location.pathname]);

  const handleDismiss = () => {
    sessionStorage.setItem('fds_name_prompt_dismissed', 'true');
    setIsOpen(false);
  };

  const handleGoToSettings = () => {
    sessionStorage.setItem('fds_name_prompt_dismissed', 'true');
    setIsOpen(false);
    navigate('/einstellungen');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-2xl overflow-hidden"
        >
          {/* Close button top right */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>

          {/* Badge & Decorative Icon */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center shadow-inner">
              <User size={32} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Persönliches Profil</span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[var(--text-main)] leading-tight">
              Wie dürfen wir dich persönlich ansprechen? 🌸
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Hallo! Schön, dass du da bist. Bitte ergänze in deinen Einstellungen kurz deinen <strong>Vor- und Nachnamen</strong>, damit wir dich in der App persönlich begleiten können.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3 pt-2">
            <button
              onClick={handleGoToSettings}
              className="w-full py-3.5 px-5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Name in den Einstellungen eintragen</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Später erinnern
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
