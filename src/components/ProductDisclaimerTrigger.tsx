import React, { useState } from 'react';

export const ProductDisclaimerTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
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
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%', padding: '0.625rem', borderRadius: '10px', background: 'var(--accent)',
                color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer'
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  );
};
