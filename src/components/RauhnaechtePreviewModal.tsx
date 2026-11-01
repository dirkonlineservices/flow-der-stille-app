import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight, BookOpen, Moon, Gift } from 'lucide-react';

const STORAGE_KEY = 'fds_rauhnaechte_preview_seen_v1';

export function RauhnaechtePreviewModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Nach 2,5 Sekunden sanft einblenden
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
        
        {/* Schließen Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          aria-label="Schließen"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={13} />
          <span>Neuerscheinung • Jetzt vorab verfügbar</span>
        </div>

        {/* Content mit Cover */}
        <div className="flex flex-col sm:flex-row gap-5 items-center mb-5">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-lg border border-[var(--border)] shrink-0">
            <img
              src="/images/products/cover_rauhnaechte.jpg"
              alt="Yggdrasils Atem Cover"
              className="w-full h-full object-cover"
              onError={(e: any) => {
                e.target.src = '/images/products/cover_mensch_sein.jpg';
              }}
            />
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] leading-tight">
              Yggdrasils Atem
            </h3>
            <p className="text-xs sm:text-sm text-[var(--accent)] font-medium">
              12 Rauhnächte auf der Schwelle
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1 text-[11px] text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1">
                <Moon size={11} className="text-[var(--accent)]" />
                <span>Auftakt: 21. Dezember</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <BookOpen size={11} className="text-[var(--accent)]" />
                <span>13 Meditationen</span>
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-5">
          Erlebe 13 geführte schamanische Seelenreisen an den Wurzeln des Weltenbaums Yggdrasil. Du kannst dir das Hörbuch schon jetzt für <strong>9,99&nbsp;€</strong> vorab sichern und selbst entscheiden, wann es für dich stimmig ist hineinzuhören – oder dich kostenlos für Rauhnächte-News und Begleit-Impulse eintragen.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/hoerbuch/rauhnaechte"
            onClick={handleClose}
            className="flex-1 py-3 px-5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm text-center transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Zur Vorschau & Vorabkauf</span>
            <ArrowRight size={15} />
          </Link>

          <button
            onClick={handleClose}
            className="py-3 px-4 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold text-xs text-center transition-colors cursor-pointer"
          >
            Später
          </button>
        </div>

      </div>
    </div>
  );
}
export default RauhnaechtePreviewModal;
