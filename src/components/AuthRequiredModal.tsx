import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, LogIn, X } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl relative text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1 rounded-lg"
          aria-label="Schließen"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-full mb-5 mx-auto text-emerald-600 border border-emerald-100">
          <Lock size={26} />
        </div>

        <h3 className="text-xl font-bold text-center mb-2 font-serif">
          Kostenlose Registrierung erforderlich
        </h3>

        <p className="text-sm text-[var(--text-muted)] text-center mb-6 leading-relaxed">
          Um geführte Atemübungen, Meditationen und exklusive Audio-Inhalte anzuhören, erstelle bitte einen kostenlosen und unverbindlichen Account bei Flow der Stille.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--accent)] text-white font-semibold shadow-md hover:bg-[var(--accent-hover)] transition-all"
          >
            <UserPlus size={18} />
            <span>Jetzt kostenlos registrieren</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-main)] font-medium hover:bg-[var(--border)] transition-all"
          >
            <LogIn size={18} />
            <span>Bereits ein Konto? Einloggen</span>
          </button>

          {/* Facebook / Meta SSO Schnell-Login */}
          <button
            onClick={() => {
              onClose();
              navigate('/login?social=facebook');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Mit Facebook anmelden</span>
          </button>
        </div>
      </div>
    </div>
  );
}
