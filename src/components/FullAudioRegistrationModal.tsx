import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, UserPlus, LogIn, X, Lock, CheckCircle2, ArrowLeft, Home } from 'lucide-react';

interface FullAudioRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioTitle?: string;
  durationText?: string;
  title?: string;
  subtitle?: string;
  returnPath?: string;
}

export default function FullAudioRegistrationModal({
  isOpen,
  onClose,
  audioTitle = 'diese Session',
  durationText,
  title,
  subtitle,
  returnPath
}: FullAudioRegistrationModalProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Escape-Taste zum Schließen unterstützen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetPath = returnPath || (location.pathname + location.search);

  const handleRegister = () => {
    onClose();
    navigate(`/register?redirectTo=${encodeURIComponent(targetPath)}`);
  };

  const handleLogin = () => {
    onClose();
    navigate(`/login?redirectTo=${encodeURIComponent(targetPath)}`);
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-[var(--text-main)] overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--accent)]" />

        {/* Deutlicher Schließen-Button oben rechts */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 rounded-xl hover:bg-[var(--bg-alt)] cursor-pointer flex items-center gap-1 text-xs"
          aria-label="Schließen"
          title="Fenster schließen"
        >
          <span className="hidden sm:inline text-xs font-medium text-[var(--text-muted)]">Schließen</span>
          <X size={20} />
        </button>

        <div className="text-center space-y-4 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] mx-auto flex items-center justify-center border border-[var(--accent)]/30">
            <ShieldCheck size={28} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              {subtitle || 'Rechtliche Absicherung & Haftungsausschluss'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
              {title || 'Möchtest du die gesamte Session kostenlos hören?'}
            </h3>
            {durationText && (
              <p className="text-xs font-mono text-[var(--accent)]">
                Volle Länge: {durationText}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed text-left bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--border)]">
            Du hast gerade die ersten <strong>45 Sekunden</strong> zur Stimmprobe gehört. 
            Aus rechtlichen Gründen (Bestätigung des Haftungsausschlusses, Ausschluss therapeutischer Heilversprechen und Eigenverantwortung) ist für die vollständige Sitzung eine einmalige, kostenlose Registrierung erforderlich.
          </p>

          <div className="space-y-2 text-left text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0" />
              <span>100% kostenlos &amp; unverbindlich – kein Abo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0" />
              <span>Bestätigung des Haftungsausschlusses wird sicher in deinem Profil hinterlegt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0" />
              <span>Sofortiger Zugriff auf alle kostenfreien Vollversionen &amp; Schnupperübungen</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[var(--border)]">
            {/* Primäre Aktionen: Registrierung & Login */}
            <button
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[var(--accent)] text-white font-semibold text-sm shadow-md hover:bg-[var(--accent-hover)] transition-all cursor-pointer active:scale-95"
            >
              <UserPlus size={17} />
              <span>Jetzt kostenlos registrieren &amp; freischalten</span>
            </button>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-main)] font-medium text-xs hover:bg-[var(--border)] transition-all cursor-pointer"
            >
              <LogIn size={15} />
              <span>Bereits registriert? Anmelden</span>
            </button>

            {/* Auswegs-Buttons: Zurück zur Startseite oder auf der Seite bleiben & weiterlesen */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleGoHome}
                className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-transparent hover:bg-[var(--bg-alt)] text-[var(--text-main)] font-medium text-xs border border-[var(--border)] transition-all cursor-pointer"
              >
                <Home size={14} className="text-[var(--accent)]" />
                <span>Zurück zur Startseite</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-transparent hover:bg-[var(--bg-alt)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium text-xs border border-[var(--border)] transition-all cursor-pointer"
              >
                <X size={14} />
                <span>Fenster schließen &amp; weiterlesen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
