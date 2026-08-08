import React, { useState, useEffect, useRef } from 'react';
import { Cookie, Shield, CheckCircle2, XCircle, ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CONSENT_STORAGE_KEY, setAnalyticsConsent, isAnalyticsAllowed } from '../lib/tracking';
import { BillingService } from '../lib/billing';

export const COOKIE_STORAGE_KEY = 'flow_cookie_consent_status';

export function openCookieConsentModal() {
  window.dispatchEvent(new CustomEvent('open-cookie-banner'));
}

export function checkConsentForAuth(): boolean {
  return true;
}

export default function CookieBanner() {
  const location = useLocation();
  const isNative = BillingService.isNative();
  const publicRoutes = ['/datenschutz', '/impressum', '/agb', '/rechtliches'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showAccordion, setShowAccordion] = useState<boolean>(false);

  useEffect(() => {
    if (isPublicRoute) {
      setIsVisible(false);
      return;
    }

    const storedStatus = localStorage.getItem(CONSENT_STORAGE_KEY) || localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!storedStatus) {
      setIsVisible(true);
    }

    const handleOpenModal = () => {
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-banner', handleOpenModal);
    return () => {
      window.removeEventListener('open-cookie-banner', handleOpenModal);
    };
  }, [location.pathname, isPublicRoute]);

  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [mobileDisclaimerChecked, setMobileDisclaimerChecked] = useState<boolean>(false);

  const handleAppChoice = (choice: 'accepted' | 'rejected') => {
    setAnalyticsConsent(choice);
    // Nach Schritt 1 (Einwilligung/Ablehnung) geht es direkt weiter zu Schritt 2 (Haftungsausschluss)
    setMobileStep(2);
  };

  const handleMobileDisclaimerConfirm = () => {
    if (!mobileDisclaimerChecked) return;
    localStorage.setItem('flow_disclaimer_accepted', 'true');
    setIsVisible(false);
  };

  const handleWebChoice = (choice: 'all' | 'necessary' | 'rejected') => {
    localStorage.setItem(COOKIE_STORAGE_KEY, choice);
    setAnalyticsConsent(choice === 'rejected' ? 'rejected' : 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) {
    if (isNative) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 bg-[var(--bg-card)] text-[var(--text-main)] px-4 py-2.5 rounded-full shadow-lg border border-[var(--border)] hover:border-[var(--accent)] transition-all text-xs font-medium group"
          title="Cookie-Einstellungen verwalten"
        >
          <Cookie size={16} className="text-[var(--accent)] group-hover:rotate-12 transition-transform" />
          <span>Cookie-Einstellungen</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------------------
  // A) NATIVES APP GATE (2-Schritt Mobile Modal für Android)
  // -------------------------------------------------------------------------------------
  if (isNative) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-black/80 backdrop-blur-lg animate-fade-in overflow-y-auto">
        <div className="rounded-3xl shadow-2xl max-w-md w-full p-7 border relative overflow-hidden transition-all my-auto bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)]">
          {/* Top Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent)] to-emerald-400"></div>

          {/* SCHRITT 1: Analytics, Firebase & Crashlytics Consent */}
          {mobileStep === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4 pt-2">
                <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-bold bg-[var(--bg-main)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                  Schritt 1 von 2: Datenschutz &amp; App-Analyse
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg-main)] text-[var(--accent)] shrink-0 border border-[var(--border)] shadow-sm">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold leading-tight">
                    Willkommen in deiner Stille
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">Flow der Stille App</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed mb-4 text-[var(--text-muted)]">
                Schön, dass du da bist! Um deine Meditations- und Atemübungen kontinuierlich zu verbessern und App-Abstürze schnell zu beheben, nutzen wir anonyme Analyseverfahren (Firebase Analytics &amp; Crashlytics).
                <br /><br />
                <span className="text-[var(--text-main)] font-medium">Deine Entscheidung ist freiwillig:</span> Auch bei Ablehnung steht dir die App in vollem Umfang zur Verfügung.
              </p>

              {/* Accordion Details */}
              <div className="mb-6 border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-main)]">
                <button
                  onClick={() => setShowAccordion(!showAccordion)}
                  className="w-full flex items-center justify-between p-3.5 text-left font-medium text-xs text-[var(--text-main)] hover:opacity-80 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Info size={16} className="text-[var(--accent)]" />
                    <span>Transparenz-Details &amp; Firebase</span>
                  </span>
                  {showAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAccordion && (
                  <div className="p-3.5 border-t border-[var(--border)] text-[11px] space-y-2 text-[var(--text-muted)] leading-relaxed">
                    <p>
                      <strong className="text-[var(--text-main)] block mb-0.5">1. Konto &amp; Käufe (Supabase):</strong> Notwendig für deine Profilverwaltung und die Freischaltung erworbener Audios.
                    </p>
                    <p>
                      <strong className="text-[var(--text-main)] block mb-0.5">2. Absturzberichte &amp; Stabilität (Firebase Crashlytics):</strong> Erfasst technische Fehler zur Behebung von App-Abstürzen.
                    </p>
                    <p>
                      <strong className="text-[var(--text-main)] block mb-0.5">3. Anonyme Nutzungsanalyse (Firebase Analytics):</strong> Hilft uns, beliebte Meditationen zu erkennen.
                    </p>
                  </div>
                )}
              </div>

              {/* Die 2 mobilen Haupt-Buttons für Schritt 1 */}
              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={() => handleAppChoice('accepted')}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-md active:scale-95 text-white bg-[var(--accent)] hover:opacity-90 cursor-pointer"
                >
                  <CheckCircle2 size={18} />
                  <span>Zustimmen &amp; Weiter zu Schritt 2 →</span>
                </button>

                <button
                  onClick={() => handleAppChoice('rejected')}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-medium text-xs transition-all border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-[var(--bg-alt)] active:scale-95 cursor-pointer"
                >
                  <span>Ablehnen &amp; Weiter zu Schritt 2 →</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] pt-3 border-t border-[var(--border)] text-[var(--text-muted)]">
                <Link to="/datenschutz" onClick={() => setIsVisible(false)} className="hover:underline text-[var(--accent)]">
                  Datenschutz
                </Link>
                <span>•</span>
                <Link to="/impressum" onClick={() => setIsVisible(false)} className="hover:underline text-[var(--accent)]">
                  Impressum
                </Link>
              </div>
            </div>
          )}

          {/* SCHRITT 2: Haftungsausschluss für Meditation & Selbsthypnose */}
          {mobileStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-3 pt-1">
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Schritt 2 von 2: Haftungsausschluss
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0 border border-amber-200 dark:border-amber-800">
                  <Shield size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold leading-tight">
                    Wichtiger Hinweis &amp; Haftung
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">Meditation &amp; Selbsthypnose</p>
                </div>
              </div>

              <div className="text-xs space-y-2.5 text-[var(--text-muted)] leading-relaxed mb-5 max-h-[40vh] overflow-y-auto pr-1">
                <p>
                  Die in dieser App bereitgestellten Meditationen, Tiefenentspannungen und Selbsthypnosen dienen ausschließlich der persönlichen Entspannung und Selbsterfahrung.
                </p>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] space-y-1 text-[11px]">
                  <p className="font-semibold text-[var(--text-main)] mb-1">Bitte beachte zwingend:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Sie ersetzen ausdrücklich keine ärztliche, psychotherapeutische oder medizinische Behandlung.</li>
                    <li>Niemals während des Autofahrens oder bei Tätigkeiten anwenden, die volle Aufmerksamkeit erfordern.</li>
                    <li>Die Nutzung erfolgt auf eigene Verantwortung und Gefahr.</li>
                  </ul>
                </div>
              </div>

              {/* Checkbox zur Bestätigung */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mobileDisclaimerChecked}
                  onChange={(e) => setMobileDisclaimerChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)] cursor-pointer shrink-0"
                />
                <span className="text-xs text-[var(--text-main)] leading-tight select-none">
                  Ich habe den Hinweis gelesen und stimme der Nutzung auf eigene Verantwortung zu.
                </span>
              </label>

              {/* Bestätigungs-Button */}
              <button
                onClick={handleMobileDisclaimerConfirm}
                disabled={!mobileDisclaimerChecked}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-md active:scale-95 text-white ${
                  mobileDisclaimerChecked 
                    ? 'bg-[var(--accent)] hover:opacity-90 cursor-pointer' 
                    : 'bg-stone-300 dark:bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle2 size={18} />
                <span>Verstanden &amp; App starten</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------------------
  // B) WEB COOKIE BANNER (Für den regulären Webseiten-Betrieb)
  // -------------------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="rounded-2xl shadow-2xl max-w-2xl w-full p-8 border relative overflow-hidden transition-all my-8 bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)]"
      >
        {/* Accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--accent)]"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--bg-main)] text-[var(--accent)] shrink-0 border border-[var(--border)]">
            <Cookie size={24} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">Datenschutz &amp; Cookies</span>
            <h2 className="text-2xl font-serif font-bold">
              Willkommen bei Flow der Stille
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-5 text-[var(--text-muted)]">
          Wir verwenden Cookies und vergleichbare Technologien, um unsere Plattform zu betreiben, Inhalte zu personalisieren und Zugriffe auf unserer Website zu analysieren. Weitere Informationen findest du in unserer{' '}
          <Link to="/datenschutz" className="underline hover:opacity-80 font-medium text-[var(--accent)]">
            Datenschutzerklärung
          </Link>{' '}
          sowie in unserem{' '}
          <Link to="/impressum" className="underline hover:opacity-80 font-medium text-[var(--accent)]">
            Impressum
          </Link>.
        </p>

        {/* Accordion for Details */}
        <div className="mb-6 border rounded-xl overflow-hidden border-[var(--border)] bg-[var(--bg-main)]">
          <button
            onClick={() => setShowAccordion(!showAccordion)}
            className="w-full flex items-center justify-between p-4 text-left font-medium text-sm transition-colors hover:opacity-80 text-[var(--text-main)]"
          >
            <span className="flex items-center gap-2">
              <Info size={16} className="text-[var(--accent)]" />
              <span>Transparenz-Details: Welche Daten &amp; wofür?</span>
            </span>
            {showAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAccordion && (
            <div className="p-4 border-t text-xs space-y-3 border-[var(--border)] text-[var(--text-muted)]">
              <div>
                <strong className="text-[var(--text-main)] block mb-1">1. Notwendige Cookies (Erforderlich)</strong>
                Sichern den Login-Status, Benutzereinstellungen, Sitzungssicherheit und den Warenkorb ab.
              </div>
              <div>
                <strong className="text-[var(--text-main)] block mb-1">2. Analyse &amp; Optimierung (Optional)</strong>
                Helfen uns zu verstehen, wie unsere Meditationsinhalte genutzt werden, um die Plattform DSGVO-konform weiterzuentwickeln.
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <button
            onClick={() => handleWebChoice('all')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-opacity shadow-sm hover:opacity-90 text-white bg-[var(--accent)] cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>Alle akzeptieren</span>
          </button>

          <button
            onClick={() => handleWebChoice('necessary')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--bg-alt)] cursor-pointer"
          >
            <Shield size={16} />
            <span>Nur notwendige</span>
          </button>
        </div>

        <div className="flex justify-center mb-2">
          <button
            onClick={() => handleWebChoice('rejected')}
            className="text-xs font-medium hover:underline px-3 py-1.5 transition-colors flex items-center gap-1.5 text-red-600 cursor-pointer"
          >
            <XCircle size={14} />
            <span>Ablehnen</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-4 border-t mt-4 flex-wrap gap-2 border-[var(--border)] text-[var(--text-muted)]">
          <span>Flow der Stille Datenschutz</span>
          <div className="flex items-center gap-3 font-medium">
            <Link to="/datenschutz" className="hover:underline text-[var(--accent)]">
              Datenschutz
            </Link>
            <span>•</span>
            <Link to="/impressum" className="hover:underline text-[var(--accent)]">
              Impressum
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AuthLink({ to, children, className, onClick, ...props }: { to: string; children: React.ReactNode; className?: string; onClick?: () => void; [key: string]: any }) {
  return (
    <Link to={to} onClick={onClick} className={className} {...props}>
      {children}
    </Link>
  );
}
