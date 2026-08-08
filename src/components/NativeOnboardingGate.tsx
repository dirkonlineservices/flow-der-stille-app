import React, { useState } from 'react';
import { Shield, Sparkles, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NativeOnboardingGateProps {
  onCompleted?: () => void;
}

export default function NativeOnboardingGate({ onCompleted }: NativeOnboardingGateProps) {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('hasAcceptedDisclaimer') !== 'true';
  });
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  const handleStart = () => {
    localStorage.setItem('hasAcceptedDisclaimer', 'true');
    localStorage.setItem('analyticsConsent', analyticsConsent ? 'true' : 'false');
    localStorage.setItem('flow_disclaimer_accepted', 'true');
    localStorage.setItem('flow_cookie_consent_status', analyticsConsent ? 'all' : 'necessary');

    if (analyticsConsent) {
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'consent_update',
          consent_choice: 'all',
          analytics_consent: true
        });

        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('consent', 'update', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted'
          });
        }
      }
      console.log('Firebase Crashlytics & Analytics initialized with user consent.');
    } else {
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'consent_update',
          consent_choice: 'necessary',
          analytics_consent: false
        });
      }
    }

    setIsOpen(false);
    if (onCompleted) {
      onCompleted();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border transition-colors flex flex-col gap-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          color: 'var(--text-main)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(var(--accent-rgb, 138, 154, 138), 0.15)', color: 'var(--accent)' }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold tracking-tight" style={{ color: 'var(--text-main)' }}>
              Willkommen bei Flow der Stille
            </h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Für die Nutzung der App sind rechtliche Grundlagen & Einstellungen erforderlich.
            </p>
          </div>
        </div>

        {/* Bereich 1: Haftungsausschluss & Nutzungsbedingungen */}
        <div 
          className="p-4 sm:p-5 rounded-2xl border flex flex-col gap-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-alt, var(--bg-card))' }}
        >
          <div className="flex items-center gap-2 font-medium text-sm" style={{ color: 'var(--text-main)' }}>
            <Shield size={18} style={{ color: 'var(--accent)' }} />
            <span>Haftungsausschluss & Nutzungsbedingungen</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Unsere App begleitet dich bei Atemübungen und innerer Ruhe. Bitte beachte, dass unsere Inhalte keinen ärztlichen Rat ersetzen. Mit Klick auf "App starten" akzeptierst du unsere Nutzungsbedingungen und den Haftungsausschluss.{' '}
            <Link 
              to="/rechtliches" 
              target="_blank" 
              className="underline font-medium inline-flex items-center gap-1 mt-1"
              style={{ color: 'var(--accent)' }}
            >
              Vollständiges Dokument lesen <Info size={12} />
            </Link>
          </p>
        </div>

        {/* Bereich 2: App-Verbesserung (Optional) */}
        <div 
          className="p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-alt, var(--bg-card))' }}
        >
          <div className="flex flex-col gap-1 pr-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
              App-Verbesserung (Optional)
            </span>
            <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Anonyme Fehlerberichte (Crashlytics) und Nutzungsdaten (Analytics) helfen uns, die App stabiler zu machen.
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={analyticsConsent}
            onClick={() => setAnalyticsConsent(!analyticsConsent)}
            className="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            style={{
              backgroundColor: analyticsConsent ? 'var(--accent)' : 'var(--border)'
            }}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                analyticsConsent ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Primary Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <span>App starten</span>
        </button>
      </div>
    </div>
  );
}
