import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, X, ArrowRight, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';

export function AdminWelcomeModal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      setIsAdmin(false);
      return;
    }

    // Wenn der Nutzer sich bereits auf der Admin-Seite befindet, Popup nicht nötig
    if (location.pathname === '/admin' || location.pathname === '/admin/freischalten') {
      return;
    }

    const storageKey = `fds_admin_welcome_seen_${user.id}`;
    const alreadySeen = localStorage.getItem(storageKey);

    if (alreadySeen === 'true') {
      return;
    }

    // Rolle prüfen
    const supabase = getSupabase();
    supabase
      .from('profiles')
      .select('rolle')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.rolle?.toLowerCase() === 'admin') {
          setIsAdmin(true);
          // Sanfter Timer für ein angenehmes Nutzererlebnis
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      }, () => setIsAdmin(false));
  }, [user, location.pathname]);

  const handleDismiss = () => {
    if (user?.id) {
      localStorage.setItem(`fds_admin_welcome_seen_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleGoToAdmin = () => {
    if (user?.id) {
      localStorage.setItem(`fds_admin_welcome_seen_${user.id}`, 'true');
    }
    setIsOpen(false);
    navigate('/admin');
  };

  if (!isOpen || !isAdmin) return null;

  const displayName = (user as any)?.first_name || (user as any)?.full_name || (user?.user_metadata?.full_name) || 'Admin';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-emerald-300 dark:border-emerald-700/60 shadow-2xl overflow-hidden"
        >
          {/* Schließen Button oben rechts */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>

          {/* Deko & Badge */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <ShieldCheck size={36} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <Sparkles size={13} />
              <span>Administrator-Rechte aktiv</span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[var(--text-main)] leading-tight">
              Willkommen im Admin-Team! 👑
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Hallo <strong>{displayName}</strong>! Dein Benutzerkonto wurde mit <strong>Administrator-Rechten</strong> für Flow der Stille ausgestattet.
            </p>

            <div className="w-full p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-left text-xs text-[var(--text-muted)] space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-main)]">
                <Gift size={14} className="text-emerald-600 shrink-0" />
                <span>Deine neuen Möglichkeiten:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Beliebige Produkte für Nutzer kostenfrei freischalten</li>
                <li>Benutzerprofile & Freischaltungen einsehen</li>
                <li>Schnellzugriff über das Burger-Menü (»Mehr«)</li>
              </ul>
            </div>
          </div>

          {/* Aktions-Buttons */}
          <div className="mt-6 space-y-3 pt-1">
            <button
              onClick={handleGoToAdmin}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🚀 Direkt zum Admin-Bereich</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Alles klar, verstanden
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
