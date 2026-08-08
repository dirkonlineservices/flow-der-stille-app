import React, { useState } from 'react';
import { useDisclaimerStatus } from '../hooks/useDisclaimerStatus';
import { Check } from 'lucide-react';

export const ProductDisclaimerTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { acceptDisclaimer } = useDisclaimerStatus();

  const handleConfirm = async () => {
    if (!isChecked) return;
    await acceptDisclaimer();
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => {
          setIsChecked(false);
          setIsOpen(true);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: '0.5rem 0',
          fontFamily: "'Inter', sans-serif"
        }}
        className="hover:text-[var(--text-main)] transition-colors"
      >
        Wichtige Hinweise zur Anwendung &amp; Haftungsausschluss
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px',
            padding: '2rem', maxWidth: '480px', width: '100%', color: 'var(--text-main)',
            fontFamily: "'Inter', sans-serif", boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
              Wichtiger Hinweis zur Anwendung
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Die angebotenen Meditationen und Selbsthypnosen dienen ausschließlich der Entspannung und ersetzen keine fachliche oder therapeutische Behandlung. Die Anwendung bei Epilepsie, Psychosen oder während des Autofahrens ist strikt untersagt. Nutzung auf eigene Verantwortung.
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex items-center justify-center">
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded border border-[var(--border)] bg-[var(--bg-alt)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-all flex items-center justify-center">
                    <Check className={`w-3.5 h-3.5 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-[var(--text-main)] font-sans select-none leading-relaxed group-hover:opacity-90">
                  Ich habe den Hinweis gelesen und stimme der Nutzung auf eigene Verantwortung zu.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  flex: 1, padding: '0.625rem', borderRadius: '10px', background: 'var(--bg-alt)',
                  color: 'var(--text-muted)', border: '1px solid var(--border)', fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer'
                }}
              >
                Abbrechen
              </button>
              <button 
                onClick={handleConfirm}
                disabled={!isChecked}
                style={{
                  flex: 1, padding: '0.625rem', borderRadius: '10px', background: isChecked ? 'var(--accent)' : 'var(--bg-alt)',
                  color: isChecked ? '#ffffff' : 'var(--text-muted)', border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: isChecked ? 'pointer' : 'not-allowed',
                  opacity: isChecked ? 1 : 0.5
                }}
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
