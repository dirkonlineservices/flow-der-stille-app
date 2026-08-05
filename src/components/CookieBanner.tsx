import React, { useState, useEffect } from 'react';
import { Cookie, Shield, CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronUp, Lock, HelpCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pushToDataLayer, trackConsentUpdate } from '../lib/tracking';

export const COOKIE_STORAGE_KEY = 'flow_cookie_consent_status';

export function openCookieConsentModal() {
  window.dispatchEvent(new CustomEvent('open-cookie-banner'));
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRejectedState, setIsRejectedState] = useState<boolean>(false);
  const [showAccordion, setShowAccordion] = useState<boolean>(false);
  const [activeAccordionTab, setActiveAccordionTab] = useState<number | null>(null);

  useEffect(() => {
    const storedStatus = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!storedStatus) {
      setIsVisible(true);
    } else if (storedStatus === 'rejected') {
      setIsRejectedState(true);
      setIsVisible(true);
    }

    const handleOpenModal = () => {
      const current = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (current === 'rejected') {
        setIsRejectedState(true);
      } else {
        setIsRejectedState(false);
      }
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-banner', handleOpenModal);
    return () => {
      window.removeEventListener('open-cookie-banner', handleOpenModal);
    };
  }, []);

  const handleChoice = (choice: 'all' | 'necessary' | 'rejected') => {
    localStorage.setItem(COOKIE_STORAGE_KEY, choice);
    trackConsentUpdate(choice);
    
    if (choice === 'rejected') {
      setIsRejectedState(true);
      setIsVisible(true); // Keep visible as access-denied lock screen
    } else {
      setIsRejectedState(false);
      setIsVisible(false);
    }

    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'consent_update',
        consent_choice: choice
      });
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            const current = localStorage.getItem(COOKIE_STORAGE_KEY);
            if (current === 'rejected') {
              setIsRejectedState(true);
            } else {
              setIsRejectedState(false);
            }
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

        {isRejectedState && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
            <Lock size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Zugriff vorübergehend eingeschränkt</h3>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                Du hast alle Cookies und Analysedienste abgelehnt. Ohne die erforderlichen Grundfunktionen und Cookies kann „Flow der Stille“ nicht ordnungsgemäß betrieben werden. Du kannst deine Berechtigungen unten jederzeit anpassen, um den vollen Zugang freizuschalten.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--bg-main)] text-[var(--accent)] shrink-0 border border-[var(--border)]">
            {isRejectedState ? <Lock size={24} /> : <Cookie size={24} />}
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">Consent Management & Privatsphäre</span>
            <h2 className="text-2xl font-serif font-bold" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {isRejectedState ? "Warum wir Cookies & Dienste benötigen" : "Willkommen bei Flow der Stille"}
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
          Wir möchten transparent erklären, warum wir Cookies und den Google Tag Manager (GTM) einsetzen: 
          <strong className="text-[var(--text-main)] font-medium"> Wir benötigen einige Cookies und essenzielle Dienste, um Kernfunktionen wie den sicheren Meditations-Sitzungsbereich, den Warenkorb und den fehlerfreien Seitenaufbau bereitzustellen</strong>, die ohne diese technisch nicht funktionieren können.
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
              <span>Transparenz-Details: Welche Daten & wofür?</span>
            </span>
            {showAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAccordion && (
            <div className="p-4 border-t text-xs space-y-3" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div>
                <strong className="text-[var(--text-main)] block mb-1">1. Notwendige Cookies (Erforderlich)</strong>
                Sichern den Login-Status, Benutzereinstellungen, Sitzungssicherheit und den Warenkorb ab. Ohne diese Cookies bricht die Kernfunktionalität ab.
              </div>
              <div>
                <strong className="text-[var(--text-main)] block mb-1">2. Analyse & Google Tag Manager (Optional)</strong>
                Helfen uns zu verstehen, wie unsere Meditationsinhalte genutzt werden, um die Plattform DSGVO-konform in Europa weiterzuentwickeln.
              </div>
              <div>
                <strong className="text-[var(--text-main)] block mb-1">3. Ihre Rechte & Kontrolle</strong>
                Sie können Ihre Einwilligung jederzeit über das Cookie-Symbol unten rechts auf der Website ändern oder widerrufen. Weitere Details in unserer{' '}
                <Link to="/datenschutz" className="underline text-[var(--accent)] font-medium">Datenschutzerklärung</Link>.
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
            <span>Alle akzeptieren &amp; Zugang freigeben</span>
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
            <span>Nur notwendige Cookies</span>
          </button>
        </div>

        <div className="flex justify-center mb-2">
          <button
            onClick={() => handleChoice('rejected')}
            className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline px-3 py-1.5 transition-colors flex items-center gap-1.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <XCircle size={14} />
            <span>Ablehnen (Zugriff einschränken)</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-4 border-t mt-4" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>Google Tag Manager (GTM-WPRLW9H9)</span>
          <Link to="/datenschutz" className="hover:underline flex items-center gap-1">
            <span>Datenschutz &amp; Impressum</span>
            <ArrowRight size={12} />
          </Link>
        </div>

      </div>
    </div>
  );
}

