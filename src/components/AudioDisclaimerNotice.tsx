import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Info, ArrowUpRight } from 'lucide-react';

interface AudioDisclaimerNoticeProps {
  className?: string;
  isLoggedIn?: boolean;
}

export default function AudioDisclaimerNotice({ className = '', isLoggedIn = false }: AudioDisclaimerNoticeProps) {
  return (
    <div className={`p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-left space-y-2.5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          <ShieldAlert size={15} />
          <span>Wichtiger Hinweis &amp; Haftungsausschluss</span>
        </div>
        {!isLoggedIn && (
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[10px] font-mono font-bold">
            Hörprobe 45 Sek. • Vollversion nach Registrierung
          </span>
        )}
      </div>

      <p className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-relaxed">
        Unsere Meditationen und Selbsthypnosen dienen der persönlichen Entspannung und Selbsterfahrung. Sie stellen ausdrücklich <strong>keine medizinische oder therapeutische Behandlung</strong> dar und ersetzen keinen Arztbesuch. <strong>Niemals beim Autofahren</strong> oder bei Tätigkeiten hören, die ungeteilte Aufmerksamkeit erfordern.
      </p>

      <div className="pt-1 flex items-center justify-between text-[11px] border-t border-[var(--border)]/60 flex-wrap gap-2">
        <span className="text-[var(--text-muted)] italic">
          Nutzung ausschließlich auf eigene Verantwortung.
        </span>
        <div className="flex items-center gap-3">
          <Link 
            to="/faq" 
            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
          >
            <span>Warum? (FAQ)</span>
          </Link>
          <Link 
            to="/rechtliches" 
            className="text-[var(--accent)] hover:underline font-medium inline-flex items-center gap-0.5"
          >
            <span>Rechtliches</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
