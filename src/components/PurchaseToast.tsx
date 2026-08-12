import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, X, ShoppingCart, HelpCircle } from 'lucide-react';

export interface PurchaseToastData {
  show: boolean;
  type: 'cancelled' | 'failed' | 'success' | 'info';
  title: string;
  message: string;
  productTitle?: string;
  showSupportLink?: boolean;
}

interface Props {
  toast: PurchaseToastData;
  onClose: () => void;
}

export function PurchaseToast({ toast, onClose }: Props) {
  // Automatisches Ausblenden nach 8 Sekunden
  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [toast.show, toast.title, toast.message]);

  if (!toast.show) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'cancelled':
        return {
          bg: 'bg-stone-900/95 dark:bg-stone-900/95 text-white border-stone-700/80',
          iconBg: 'bg-stone-800 text-stone-300',
          icon: <ShoppingCart size={20} className="text-amber-400" />,
          badge: 'Kauf abgebrochen',
          badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        };
      case 'failed':
        return {
          bg: 'bg-stone-900/95 dark:bg-stone-900/95 text-white border-red-500/40',
          iconBg: 'bg-red-500/15 text-red-400',
          icon: <AlertCircle size={20} className="text-red-400" />,
          badge: 'Kauf nicht abgeschlossen',
          badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20'
        };
      case 'success':
        return {
          bg: 'bg-stone-900/95 dark:bg-stone-900/95 text-white border-emerald-500/40',
          iconBg: 'bg-emerald-500/15 text-emerald-400',
          icon: <CheckCircle2 size={20} className="text-emerald-400" />,
          badge: 'Kauf erfolgreich',
          badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        };
      default:
        return {
          bg: 'bg-stone-900/95 dark:bg-stone-900/95 text-white border-stone-700',
          iconBg: 'bg-stone-800 text-stone-300',
          icon: <HelpCircle size={20} className="text-blue-400" />,
          badge: 'Hinweis',
          badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        };
    }
  };

  const style = getStyle();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-4 sm:right-6 z-[9999] max-w-sm w-[calc(100vw-2rem)] shadow-2xl rounded-2xl backdrop-blur-md"
      >
        <div className={`rounded-2xl p-4.5 ${style.bg} border shadow-2xl`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0 mt-0.5 border border-white/5`}>
              {style.icon}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badgeColor}`}>
                  {style.badge}
                </span>
              </div>

              <h4 className="font-semibold text-sm leading-snug text-white">
                {toast.title}
              </h4>

              {toast.productTitle && (
                <p className="text-xs font-medium text-amber-300/90 truncate mt-0.5">
                  {toast.productTitle}
                </p>
              )}

              <p className="text-xs text-stone-300 leading-relaxed mt-1.5">
                {toast.message}
              </p>

              {toast.type === 'cancelled' && (
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-stone-400 italic flex items-center gap-1.5">
                  <span>💡 Es wurde kein Betrag abgebucht. Du kannst es jederzeit erneut versuchen.</span>
                </div>
              )}

              {toast.showSupportLink && (
                <div className="mt-3 pt-2 border-t border-white/10">
                  <a
                    href={`mailto:hallo@flow-der-stille.de?subject=${encodeURIComponent(`Hilfe beim Kauf: ${toast.productTitle || 'Produkt'}`)}&body=${encodeURIComponent(`Hallo Flow der Stille Team,\n\nich hatte Rückfragen/Probleme beim Kauf von "${toast.productTitle || 'Produkt'}".\n\nBitte helft mir weiter.`)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-lg text-xs font-medium transition"
                  >
                    ✉️ Support kontaktieren
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition shrink-0"
              aria-label="Schließen"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
