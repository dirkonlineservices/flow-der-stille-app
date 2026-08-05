import React, { useState, useEffect, useRef } from 'react';
import { Cookie, Shield, CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronUp, Lock, HelpCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { pushToDataLayer, trackConsentUpdate } from '../lib/tracking';
import { useAuth } from '../context/AuthContext';

export const COOKIE_STORAGE_KEY = 'flow_cookie_consent_status';

export function openCookieConsentModal() {
  window.dispatchEvent(new CustomEvent('open-cookie-banner'));
}

export function checkConsentForAuth(): boolean {
  const status = localStorage.getItem(COOKIE_STORAGE_KEY);
  if (status === 'all' || status === 'necessary') {
    return true;
  }
  if (sessionStorage.getItem('suppress_newsletter_modal') === 'true') {
    return true;
  }
  window.dispatchEvent(new CustomEvent('open-cookie-banner-auth'));
  return false;
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAuthNotice, setIsAuthNotice] = useState<boolean>(false);
  const [showAccordion, setShowAccordion] = useState<boolean>(false);
  const hasPushedInitialConsent = useRef<boolean>(false);

  useEffect(() => {
    const storedStatus = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!storedStatus) {
      setIsVisible(true);
    } else {
      if (!hasPushedInitialConsent.current) {
        hasPushedInitialConsent.current = true;
        if (typeof window !== 'undefined') {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'consent_update',
            consent_choice: storedStatus
          });

          if (typeof (window as any).gtag === 'function') {
            if (storedStatus === 'all') {
              (window as any).gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
              });
            } else if (storedStatus === 'necessary') {
              (window as any).gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'granted'
              });
            } else {
              (window as any).gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
              });
            }
          }
        }
      }
    }

    const handleOpenModal = () => {
      setIsAuthNotice(false);
      setIsVisible(true);
    };

    const handleOpenAuthModal = () => {
      if (sessionStorage.getItem('suppress_newsletter_modal') === 'true') {
        return;
      }
      setIsAuthNotice(true);
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-banner', handleOpenModal);
    window.addEventListener('open-cookie-banner-auth', handleOpenAuthModal);
    return () => {
      window.removeEventListener('open-cookie-banner', handleOpenModal);
      window.removeEventListener('open-cookie-banner-auth', handleOpenAuthModal);
    };
  }, []);

  const handleChoice = (choice: 'all' | 'necessary' | 'rejected') => {
    localStorage.setItem(COOKIE_STORAGE_KEY, choice);
    trackConsentUpdate(choice);

    if (choice === 'rejected') {
      const pathname = window.location.pathname;
      if (pathname.includes('/login') || pathname.includes('/register')) {
        setIsAuthNotice(true);
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsAuthNotice(false);
      }
    } else {
      setIsVisible(false);
      setIsAuthNotice(false);
    }

    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'consent_update',
        consent_choice: choice
      });

      if (typeof (window as any).gtag === 'function') {
        if (choice === 'all') {
          (window as any).gtag('consent', 'update', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted'
          });
        } else if (choice === 'necessary') {
          (window as any).gtag('consent', 'update', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'granted'
          });
        } else {
          (window as any).gtag('consent', 'update', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
          });
        }
      }
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            setIsAuthNotice(false);
            setIsVisible(true);
          }}
          className="flex items-center gap-2 bg-[var(--bg-card)] text-[var(--text-main)] px-4 py-2.5 rounded-full shadow-lg border border-[var(--border)] hover:border-[var(--accent)] transition-all text-xs font-medium group"
          title="Cookie-Einstellungen verwalten"
        >
          <Cookie size={16} className="text-[var(--accent)] group-hover:rotate-12 transition-transform" />
          <span>Cookie-Einstellungen</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="rounded-2xl shadow-2xl max-w-2xl w-full p-8 border relative overflow-hidden transition-all my-8"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          color: 'var(--text-main)'
        }}
      >
        {/* Accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--accent)]"></div>

        {isAuthNotice && (
          <div className="mb-6 p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}>
            <Lock size={20} className="text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-main)' }}>Authentifizierung &amp; Registrierung</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Für die Kontoerstellung und Nutzung des persönlichen Bereichs ist mindestens die Zustimmung für notwendige Dienste erforderlich.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--bg-main)] text-[var(--accent)] shrink-0 border border-[var(--border)]">
            <Cookie size={24} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">Datenschutz &amp; Cookies</span>
            <h2 className="text-2xl font-serif font-bold" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Willkommen bei Flow der Stille
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
          Wir verwenden Cookies und vergleichbare Technologien, um unsere Plattform zu betreiben, Inhalte zu personalisieren und Zugriffe auf unserer Website zu analysieren. Weitere Informationen findest du in unserer{' '}
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 font-medium" style={{ color: 'var(--accent)' }}>
            Datenschutzerklärung
          </a>{' '}
          sowie in unserem{' '}
          <a href="/impressum" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 font-medium" style={{ color: 'var(--accent)' }}>
            Impressum
          </a>.
        </p>

        {/* Accordion for Details */}
        <div className="mb-6 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-main)' }}>
          <button
            onClick={() => setShowAccordion(!showAccordion)}
            className="w-full flex items-center justify-between p-4 text-left font-medium text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}
          >
            <span className="flex items-center gap-2">
              <Info size={16} className="text-[var(--accent)]" />
              <span>Transparenz-Details: Welche Daten &amp; wofür?</span>
            </span>
            {showAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAccordion && (
            <div className="p-4 border-t text-xs space-y-3" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div>
                <strong className="text-[var(--text-main)] block mb-1">1. Notwendige Cookies (Erforderlich)</strong>
                Sichern den Login-Status, Benutzereinstellungen, Sitzungssicherheit und den Warenkorb ab.
              </div>
              <div>
                <strong className="text-[var(--text-main)] block mb-1">2. Analyse &amp; Google Tag Manager (Optional)</strong>
                Helfen uns zu verstehen, wie unsere Meditationsinhalte genutzt werden, um die Plattform DSGVO-konform in Europa weiterzuentwickeln.
              </div>
              <div>
                <strong className="text-[var(--text-main)] block mb-1">3. Ihre Rechte &amp; Kontrolle</strong>
                Sie können Ihre Einwilligung jederzeit über das Cookie-Symbol unten rechts auf der Website ändern oder widerrufen.
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <button
            onClick={() => handleChoice('all')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-opacity shadow-sm hover:opacity-90 text-white"
            style={{ backgroundColor: 'var(--accent)', fontFamily: "'Inter', sans-serif" }}
          >
            <CheckCircle2 size={16} />
            <span>Alle akzeptieren</span>
          </button>

          <button
            onClick={() => handleChoice('necessary')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors border"
            style={{ 
              backgroundColor: 'var(--bg-main)', 
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
              fontFamily: "'Inter', sans-serif" 
            }}
          >
            <Shield size={16} />
            <span>Nur notwendige</span>
          </button>
        </div>

        <div className="flex justify-center mb-2">
          <button
            onClick={() => handleChoice('rejected')}
            className="text-xs font-medium hover:underline px-3 py-1.5 transition-colors flex items-center gap-1.5 text-red-600"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <XCircle size={14} />
            <span>Ablehnen</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-4 border-t mt-4 flex-wrap gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>Google Tag Manager (GTM-WPRLW9H9)</span>
          <div className="flex items-center gap-3 font-medium">
            <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="hover:underline text-[var(--accent)]">
              Datenschutz
            </a>
            <span>•</span>
            <a href="/impressum" target="_blank" rel="noopener noreferrer" className="hover:underline text-[var(--accent)]">
              Impressum
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AuthLink({ to, children, className, onClick, ...props }: { to: string; children: React.ReactNode; className?: string; onClick?: () => void; [key: string]: any }) {
  const { setAuthFlow } = useAuth();
  const handleClick = (e: React.MouseEvent) => {
    if (to === '/login' || to === '/register') {
      setAuthFlow(true);
      sessionStorage.setItem('suppress_newsletter_modal', 'true');
    }
    if (onClick) onClick();
  };

  return (
    <Link to={to} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
