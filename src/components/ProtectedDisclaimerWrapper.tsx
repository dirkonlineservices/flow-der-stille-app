import React from 'react';
import { useDisclaimerStatus } from '../hooks/useDisclaimerStatus';

interface ProtectedAreaProps {
  user?: any;
  supabaseClient?: any;
  children: React.ReactNode;
}

export const ProtectedDisclaimerWrapper: React.FC<ProtectedAreaProps> = ({ children }) => {
  const { hasAccepted, loading, acceptDisclaimer } = useDisclaimerStatus();

  if (loading) return null;

  if (!hasAccepted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px',
          padding: '2.5rem', maxWidth: '520px', width: '100%', color: 'var(--text-main)',
          fontFamily: "'Inter', sans-serif"
        }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Wichtiger Hinweis zur Anwendung
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Bevor du den Bereich für Meditationen und Selbsthypnose betreten kannst, bestätige bitte, dass du die Anwendung auf eigene Verantwortung nutzt und keine gesundheitlichen Ausschlussgründe (wie Epilepsie oder akute Psychosen) vorliegen.
          </p>
          <button 
            onClick={acceptDisclaimer}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '14px', background: 'var(--accent)',
              color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
            }}
          >
            Ich habe den Hinweis gelesen und stimme der Nutzung auf eigene Verantwortung zu.
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
