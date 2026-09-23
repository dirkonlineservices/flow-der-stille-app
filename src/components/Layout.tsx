import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Wind, Utensils, BookOpen, ShoppingBag, X, Menu, 
  Moon, Sun, Settings as SettingsIcon, LogIn, UserCheck, 
  Info, Shield, FileText, Scale, Headphones, HelpCircle,
  ShieldCheck, Gift, User, Heart, Sparkles, ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AdminTools } from './AdminTools';
import { ProductDisclaimerTrigger } from './ProductDisclaimerTrigger';
import { getSupabase } from '../lib/supabaseClient';
import { getOfflineHoerproben } from '../lib/offlineProductsService';
import { AppDownloadBanner } from './AppDownloadBanner';
import SmartAppBanner from './SmartAppBanner';
import { NewContentNotification } from './NewContentNotification';
import { PlayStoreUpdateModal } from './PlayStoreUpdateModal';
import { NamePromptModal } from './NamePromptModal';
import { AdminWelcomeModal } from './AdminWelcomeModal';
import { checkUserIsAdmin } from '../lib/adminSecurity';
import { APP_VERSION } from '../version';
import { trackMetaPageView } from '../lib/metaPixel';

// 📊 Typsicherer Tracking-Helper für virtuelle Seitenaufrufe (SPA-Ready)
const pushVirtualPageView = (pathname: string, search: string) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'virtual_page_view',
      page_path: pathname + search,
      page_title: document.title || 'Flow der Stille'
    });
    trackMetaPageView();
  }
};

export function GooglePlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.45 1.45 0 01-.61-1.186V3a1.45 1.45 0 01.609-1.186z" fill="#4285F4"/>
      <path d="M17.062 8.73L13.792 12l3.27 3.27 3.659-2.091c.712-.407.712-1.951 0-2.358l-3.659-2.091z" fill="#FBBC04"/>
      <path d="M3.609 1.814l10.183 10.186L17.062 8.73 6.136 2.486c-.752-.43-1.748-.288-2.527.328z" fill="#EA4335"/>
      <path d="M3.609 22.186l2.527.328 10.926-6.244-3.27-3.27L3.609 22.186z" fill="#34A853"/>
    </svg>
  );
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [hasHoerproben, setHasHoerproben] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openFooterSilos, setOpenFooterSilos] = useState<Record<string, boolean>>({
    silo1: false,
    silo2: false,
    silo3: false,
    silo4: false,
  });

  const toggleFooterSilo = (key: string) => {
    setOpenFooterSilos(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isNativeApp = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
  const isPremiumOrAppPage = location.pathname.startsWith('/premium') || location.pathname.startsWith('/app') || location.pathname.startsWith('/android-app') || location.pathname.startsWith('/playstore');

  // Prüfen ob der Nutzer Admin-Rechte hat
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    checkUserIsAdmin(user.id, user.email).then(adminStatus => {
      setIsAdmin(adminStatus);
    });
  }, [user]);

  // Dynamisch prüfen ob Hörproben existieren (offline sofort aktiv)
  useEffect(() => {
    if (getOfflineHoerproben().length > 0) {
      setHasHoerproben(true);
    }
    Promise.race([
      getSupabase()
        .from('produkte')
        .select('id', { count: 'exact', head: false })
        .not('hoerprobe_url', 'is', null)
        .neq('hoerprobe_url', ''),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
      .then((res: any) => {
        if (res?.count && res.count > 0) setHasHoerproben(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    pushVirtualPageView(location.pathname, location.search);
  }, [location]);

  const handleBottomNavClick = (name: string) => {
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'navigation_bottom',
        link_name: name
      });
    }
  };

  const handleMenuClick = (name: string) => {
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'navigation_menu',
        link_name: name
      });
    }
    setIsSlideUpOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-24 md:pb-0 md:pl-24 transition-colors duration-300 flex flex-col justify-between">
      
      {/* Smarter App-Banner für mobile Browserbesucher (Google Play Download Push) */}
      <SmartAppBanner />

      {/* Top Right Corner Action Buttons */}
      <div className="fixed top-3.5 sm:top-4 right-3 sm:right-8 z-40 flex items-center gap-2">
        {!user ? (
          <Link
            to="/anmelden"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Jetzt anmelden oder registrieren"
          >
            <LogIn size={15} />
            <span>Anmelden</span>
          </Link>
        ) : (
          <Link
            to="/einstellungen"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-main)] text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Mein Profil / Einstellungen"
          >
            <User size={14} className="text-[var(--accent)]" />
            <span className="hidden sm:inline">Mein Bereich</span>
          </Link>
        )}

        {!isNativeApp && (
          <a
            href="https://play.google.com/store/apps/details?id=app.flowderstille.de"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).dataLayer) {
                (window as any).dataLayer.push({
                  event: 'app_download_click',
                  source: 'top_nav_button',
                  destination: 'google_play_store'
                });
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] text-[var(--text-main)] text-xs font-semibold hover:border-[var(--accent)] hover:bg-[var(--bg-alt)] transition-all shadow-xs cursor-pointer"
            title="Flow der Stille App direkt im Google Play Store öffnen"
          >
            <GooglePlayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="font-medium">App</span>
          </a>
        )}
      </div>

      <div className="w-full">
        {/* Desktop Sidebar */}
        <nav aria-label="Hauptnavigation Desktop" className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 bg-[var(--bg-card)] border-r border-[var(--border)] z-50 overflow-y-auto">
          <Link to="/" className="mb-10 p-2 rounded-full hover:bg-[var(--bg-alt)] transition-colors shrink-0">
            <img src="/logo-transparent.png" alt="Logo" width="32" height="32" className="w-8 h-8" decoding="async" />
          </Link>
          
          <div className="flex flex-col gap-6 w-full">
            <NavLink to={user ? "/dashboard" : "/"} icon={<Home />} label={user ? "Dashboard" : t('nav.home')} onClick={() => handleBottomNavClick(user ? 'Dashboard' : 'Start')} />
            <NavLink to="/uebungen" icon={<Wind />} label={t('nav.breathe')} onClick={() => handleBottomNavClick('Atmen')} />
            <NavLink to="/rezepte" icon={<Utensils />} label={t('nav.nourish')} onClick={() => handleBottomNavClick('Ernährung')} />
            <NavLink to="/wissen" icon={<BookOpen />} label={t('nav.learn')} onClick={() => handleBottomNavClick('Lernen')} />
            <NavLink to="/premium" icon={<ShoppingBag />} label="Premium" onClick={() => handleBottomNavClick('Premium')} />
            <button 
              onClick={() => {
                handleBottomNavClick('Mehr');
                setIsSlideUpOpen(true);
              }}
              className="p-2 rounded-xl hover:bg-[var(--bg-alt)] transition-colors text-[var(--text-muted)] flex flex-col items-center gap-1 w-full cursor-pointer"
            >
              <Menu size={24} />
              <span className="text-[10px] font-medium tracking-wide uppercase">Mehr</span>
            </button>
          </div>
        </nav>

        {/* Mobile Bottom Bar (unter 768px): App-ähnlich fixiert am unteren Rand */}
        <nav aria-label="Hauptnavigation Mobil" className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border)] px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-around items-center z-50 shadow-lg">
          <MobileNavLink to={user ? "/dashboard" : "/"} icon={<Home />} label={user ? "Dashboard" : "Start"} onClick={() => handleBottomNavClick(user ? 'Dashboard' : 'Start')} />
          <MobileNavLink to="/uebungen" icon={<Wind />} label="Atmen" onClick={() => handleBottomNavClick('Atmen')} />
          <MobileNavLink to="/premium" icon={<ShoppingBag />} label="Premium" onClick={() => handleBottomNavClick('Premium')} />
          <button 
            onClick={() => {
              handleBottomNavClick('Mehr');
              setIsSlideUpOpen(true);
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Menu size={22} strokeWidth={2} />
            <span className="text-[9px] font-semibold tracking-wide uppercase">Mehr</span>
          </button>
        </nav>

        {/* Main Content Area: Dynamisch responsiv skalierend zwischen Laptop (max-w-5xl) und großem Desktop-Bildschirm (2xl:max-w-7xl) */}
        <main className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-8 pt-4 md:pt-6 transition-all duration-300">
          <div key={location.pathname} className="animate-in fade-in duration-200">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Kompakt-Banner für Android App (Nicht auf /premium oder /app Unterseiten) */}
      {!isNativeApp && !isPremiumOrAppPage && (
        <div className="px-4 md:px-8">
          <AppDownloadBanner />
        </div>
      )}

      {/* ─── SEO-OPTIMIERTER LINK-JUICE FOOTER (4 THEMEN-SILOS) ─── */}
      {/* Auf Mobile: Aufklappbare Akkordeon-Kategorien für beste Übersicht • Auf Desktop: 4 edle Säulen • 100 % SEO Link-Juice dauerhaft im DOM */}
      <footer className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 md:px-8 mt-10 pt-8 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-8 border-t border-[var(--border)] transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-8 mb-8 text-left">
          {/* Silo 1: Kostenlose Angebote & Praxis */}
          <div className="bg-[var(--bg-card)] md:bg-transparent p-3.5 md:p-0 rounded-2xl md:rounded-none border border-[var(--border)] md:border-none space-y-2 md:space-y-3">
            <button
              type="button"
              onClick={() => toggleFooterSilo('silo1')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none cursor-pointer"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
                Kostenlose Praxis
              </h4>
              <ChevronDown
                size={16}
                className={`text-[var(--accent)] transition-transform duration-200 md:hidden ${openFooterSilos.silo1 ? 'rotate-180' : ''}`}
              />
            </button>
            <ul className={`space-y-2 text-xs pt-1 md:pt-0 ${openFooterSilos.silo1 ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link to="/meditation" onClick={() => handleMenuClick('Kostenlose Meditation')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Kostenlose Meditation
                </Link>
              </li>
              <li>
                <Link to="/selbsthypnose" onClick={() => handleMenuClick('Kostenlose Selbsthypnose')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Kostenlose Selbsthypnose
                </Link>
              </li>
              <li>
                <Link to="/hoerproben" onClick={() => handleMenuClick('Kostenlose Hörproben')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Kostenlose Hörproben
                </Link>
              </li>
              <li>
                <Link to="/uebungen" onClick={() => handleMenuClick('Atemübungen & Vagusnerv')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Atemübungen &amp; Vagusnerv
                </Link>
              </li>
              <li>
                <Link to="/atemchat" onClick={() => handleMenuClick('Interaktiver Atemraum')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Interaktiver Atemraum
                </Link>
              </li>
            </ul>
          </div>

          {/* Silo 2: Hörbücher & Mediathek */}
          <div className="bg-[var(--bg-card)] md:bg-transparent p-3.5 md:p-0 rounded-2xl md:rounded-none border border-[var(--border)] md:border-none space-y-2 md:space-y-3">
            <button
              type="button"
              onClick={() => toggleFooterSilo('silo2')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none cursor-pointer"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
                Hörbücher &amp; Audio
              </h4>
              <ChevronDown
                size={16}
                className={`text-[var(--accent)] transition-transform duration-200 md:hidden ${openFooterSilos.silo2 ? 'rotate-180' : ''}`}
              />
            </button>
            <ul className={`space-y-2 text-xs pt-1 md:pt-0 ${openFooterSilos.silo2 ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link to="/hoerbuecher" onClick={() => handleMenuClick('Hörbuch-Übersicht')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Hörbuch-Übersicht
                </Link>
              </li>
              <li>
                <Link to="/hoerbuch/schmetterling" onClick={() => handleMenuClick('Der Schmetterling')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Der Schmetterling (Trauer &amp; Trost)
                </Link>
              </li>
              <li>
                <Link to="/hoerbuch/mensch_sein" onClick={() => handleMenuClick('Mensch sein')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Mensch sein (Mut zum Echtsein)
                </Link>
              </li>
              <li>
                <Link to="/premium" onClick={() => handleMenuClick('Premium Mediathek')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Premium Mediathek (ab 1,99 €)
                </Link>
              </li>
              <li>
                <Link to="/app" onClick={() => handleMenuClick('Android App')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Android App im Play Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Silo 3: Wissen & Philosophie */}
          <div className="bg-[var(--bg-card)] md:bg-transparent p-3.5 md:p-0 rounded-2xl md:rounded-none border border-[var(--border)] md:border-none space-y-2 md:space-y-3">
            <button
              type="button"
              onClick={() => toggleFooterSilo('silo3')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none cursor-pointer"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] font-mono">
                Wissen &amp; Vision
              </h4>
              <ChevronDown
                size={16}
                className={`text-[var(--accent)] transition-transform duration-200 md:hidden ${openFooterSilos.silo3 ? 'rotate-180' : ''}`}
              />
            </button>
            <ul className={`space-y-2 text-xs pt-1 md:pt-0 ${openFooterSilos.silo3 ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link to="/blog/warum-flow-der-stille-kostenlose-meditation-ohne-abo" onClick={() => handleMenuClick('Unsere Vision: Warum kein Abo?')} className="text-[var(--accent)] hover:underline transition-colors font-medium block py-0.5">
                  Unsere Vision (Warum kein Abo?)
                </Link>
              </li>
              <li>
                <Link to="/wissen" onClick={() => handleMenuClick('Nervensystem verstehen')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Nervensystem verstehen
                </Link>
              </li>
              <li>
                <Link to="/rezepte" onClick={() => handleMenuClick('Darm-Hirn-Achse & Ernährung')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Darm-Hirn-Achse &amp; Ernährung
                </Link>
              </li>
              <li>
                <Link to="/blog" onClick={() => handleMenuClick('Blog & Impulse')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Blog &amp; Impulse
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={() => handleMenuClick('Häufige Fragen (FAQ)')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Häufige Fragen (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Silo 4: Transparenz & Rechtliches */}
          <div className="bg-[var(--bg-card)] md:bg-transparent p-3.5 md:p-0 rounded-2xl md:rounded-none border border-[var(--border)] md:border-none space-y-2 md:space-y-3">
            <button
              type="button"
              onClick={() => toggleFooterSilo('silo4')}
              className="w-full flex items-center justify-between text-left md:pointer-events-none cursor-pointer"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Recht &amp; Kontakt
              </h4>
              <ChevronDown
                size={16}
                className={`text-[var(--text-muted)] transition-transform duration-200 md:hidden ${openFooterSilos.silo4 ? 'rotate-180' : ''}`}
              />
            </button>
            <ul className={`space-y-2 text-xs pt-1 md:pt-0 ${openFooterSilos.silo4 ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link to="/kontakt" onClick={() => handleMenuClick('Kontakt')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Kontakt &amp; Anfragen
                </Link>
              </li>
              <li>
                <Link to="/impressum" onClick={() => handleMenuClick('Impressum')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" onClick={() => handleMenuClick('Datenschutz')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link to="/agb" onClick={() => handleMenuClick('AGB')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  AGB &amp; Widerruf
                </Link>
              </li>
              <li>
                <Link to="/rechtliches" onClick={() => handleMenuClick('Rechtliches')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Haftungsausschluss
                </Link>
              </li>
              <li>
                <Link to="/versand" onClick={() => handleMenuClick('Versand & Retouren')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Versand &amp; Retouren
                </Link>
              </li>
              <li>
                <Link to="/konto-loeschen" onClick={() => handleMenuClick('Konto löschen')} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors block py-0.5">
                  Konto &amp; Daten löschen
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Herzensprojekt */}
        <div className="pt-6 border-t border-[var(--border)]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="Flow der Stille Logo" width="20" height="20" className="w-5 h-5 object-contain" decoding="async" />
            <span>&copy; {new Date().getFullYear()} Flow der Stille • Jacqueline, Lisa und Dirk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/kontakt" className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-[11px] font-semibold hover:opacity-90 transition shadow-xs">
              Kontakt aufnehmen
            </Link>
            <ProductDisclaimerTrigger />
          </div>
        </div>
      </footer>

      {/* Slide-Up Menü (Drawer) für Mobil & Desktop "Mehr" */}
      {isSlideUpOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSlideUpOpen(false)}
            className="absolute inset-0 bg-black/50 transition-opacity duration-200"
          />

          {/* Slide-Up Content Card */}
          <div
            className="relative w-full max-w-xl bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-3xl p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto text-[var(--text-main)] flex flex-col gap-6 animate-in slide-in-from-bottom duration-250 ease-out"
            onClick={e => e.stopPropagation()}
          >
              {/* Drag Indicator Handle */}
              <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto -mt-2 opacity-60" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                    <Menu size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-[var(--text-main)]">Mehr entdecken</h3>
                    <p className="text-xs text-[var(--text-muted)]">Alle Bereiche & Einstellungen auf einen Blick</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSlideUpOpen(false)}
                  className="p-2.5 rounded-full bg-[var(--bg-alt)] hover:opacity-80 transition-opacity text-[var(--text-main)] cursor-pointer"
                  aria-label="Schließen"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Action Buttons (Groß, abgerundet, Icon links) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dunkelmodus Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                    handleMenuClick(theme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren');
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-alt)] text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)]">
                      {theme === 'light' ? 'Dunkelmodus' : 'Hellmodus'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Design anpassen</div>
                  </div>
                </button>

                {/* Ernährung */}
                <Link
                  to="/rezepte"
                  onClick={() => handleMenuClick('Ernährung')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-alt)] text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Utensils size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)]">{t('nav.nourish')}</div>
                    <div className="text-xs text-[var(--text-muted)]">Gesunde Rezepte</div>
                  </div>
                </Link>

                {/* Lernen & Wissen */}
                <Link
                  to="/wissen"
                  onClick={() => handleMenuClick('Lernen & Wissen')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-alt)] text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)]">{t('nav.learn')}</div>
                    <div className="text-xs text-[var(--text-muted)]">Wissen &amp; Meditation</div>
                  </div>
                </Link>

                {/* Klangproben & Hörproben - zur dedizierten Landingpage */}
                {hasHoerproben && (
                  <Link
                    to="/klangproben"
                    onClick={() => handleMenuClick('Klangproben')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-amber-400 transition-all text-left shadow-xs group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Headphones size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-main)]">Klangproben</div>
                      <div className="text-xs text-[var(--text-muted)]">Kostenlos reinhören</div>
                    </div>
                  </Link>
                )}

                {/* Einstellungen */}
                {user && (
                  <Link
                    to="/settings"
                    onClick={() => handleMenuClick('Einstellungen')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[var(--bg-alt)] text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <SettingsIcon size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-main)]">{t('nav.settings')}</div>
                      <div className="text-xs text-[var(--text-muted)]">Konto & Benachrichtigungen</div>
                    </div>
                  </Link>
                )}

                {/* Hörbücher-Themenseite */}
                <Link
                  to="/hoerbuecher"
                  onClick={() => handleMenuClick('Hörbücher')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <span>Hörbücher</span>
                      <span className="text-[9px] bg-[var(--accent)] text-white font-bold px-1.5 py-0.5 rounded-full uppercase">Neu</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Die Hörbuch-Welt von Flow der Stille</div>
                  </div>
                </Link>

                {/* Kostenlose Meditationen */}
                <Link
                  to="/meditation"
                  onClick={() => handleMenuClick('Kostenlose Meditationen')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Heart size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <span>Meditationen</span>
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase">Gratis</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Kostenlose Meditation &amp; Herzöffnung</div>
                  </div>
                </Link>

                {/* Kostenlose Selbsthypnose */}
                <Link
                  to="/selbsthypnose"
                  onClick={() => handleMenuClick('Kostenlose Selbsthypnose')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Moon size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <span>Selbsthypnose</span>
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase">Gratis</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Kostenlose Selbsthypnose &amp; Schlaf</div>
                  </div>
                </Link>

                {/* Blog & Vision */}
                <Link
                  to="/blog"
                  onClick={() => handleMenuClick('Blog & Impulse')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <span>Blog &amp; Vision</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Warum kein Abo? Unsere Mission</div>
                  </div>
                </Link>

                {/* Admin-Bereich (NUR für Administratoren mit rolle = 'admin' in profiles sichtbar) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => handleMenuClick('Admin-Bereich')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 hover:border-emerald-500 transition-all text-left shadow-xs group sm:col-span-2 cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                      <ShieldCheck size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <span>Admin-Bereich</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Admin</span>
                      </div>
                      <div className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Produkte freischalten & Benutzerrechte verwalten</div>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs pr-1">
                      Öffnen →
                    </div>
                  </Link>
                )}

                {/* Anmelden / Profil (Daumenerreichbarkeit optimiert durch prominente Platzierung) */}
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      handleMenuClick('Logout');
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-red-500 transition-all text-left shadow-xs group cursor-pointer sm:col-span-2"
                  >
                    <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <LogIn size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-main)]">Abmelden (Logout)</div>
                      <div className="text-xs text-[var(--text-muted)]">Aus dem Konto ausloggen</div>
                    </div>
                  </button>
                ) : (
                  <Link
                    to="/anmelden"
                    onClick={() => handleMenuClick('Anmelden / Profil')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--accent)] text-white transition-all text-left shadow-md group sm:col-span-2 hover:opacity-95"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <LogIn size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">Anmelden & Profil</div>
                      <div className="text-xs text-white/80">Zugang zu exklusiven Inhalten & Empfehlungen</div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Sektion "RECHTLICHES & SICHERHEIT" */}
              <div className="border-t border-[var(--border)] pt-5">
                <h4 className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-muted)] mb-3">
                  Rechtliches & Sicherheit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    to="/impressum"
                    onClick={() => handleMenuClick('Impressum')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-medium text-[var(--text-main)]"
                  >
                    <Info size={16} className="text-[var(--accent)] shrink-0" />
                    <span>Impressum</span>
                  </Link>
                  <Link
                    to="/datenschutz"
                    onClick={() => handleMenuClick('Datenschutz')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-medium text-[var(--text-main)]"
                  >
                    <Shield size={16} className="text-[var(--accent)] shrink-0" />
                    <span>Datenschutz</span>
                  </Link>
                  <Link
                    to="/agb"
                    onClick={() => handleMenuClick('AGB')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-medium text-[var(--text-main)]"
                  >
                    <FileText size={16} className="text-[var(--accent)] shrink-0" />
                    <span>AGB</span>
                  </Link>
                  <Link
                    to="/faq"
                    onClick={() => handleMenuClick('FAQ')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-medium text-[var(--text-main)]"
                  >
                    <HelpCircle size={16} className="text-[var(--accent)] shrink-0" />
                    <span>Häufige Fragen (FAQ)</span>
                  </Link>
                  <Link
                    to="/rechtliches"
                    onClick={() => handleMenuClick('Rechtliches & KI')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-medium text-[var(--text-main)]"
                  >
                    <Scale size={16} className="text-[var(--accent)] shrink-0" />
                    <span>Rechtliches &amp; KI</span>
                  </Link>
                </div>

                {/* Dezent untergeordnete Shop-Rechte */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
                  <Link 
                    to="/versand" 
                    onClick={() => handleMenuClick('Versand & Lieferung')}
                    className="hover:text-[var(--text-main)] hover:underline"
                  >
                    Versand
                  </Link>
                  <span>•</span>
                  <Link 
                    to="/rueckgaberichtlinie" 
                    onClick={() => handleMenuClick('Rückgaberichtlinie')}
                    className="hover:text-[var(--text-main)] hover:underline"
                  >
                    Rückgaberichtlinie
                  </Link>
                  <span>•</span>
                  <Link 
                    to="/online-widerruf" 
                    onClick={() => handleMenuClick('Online-Widerruf')}
                    className="hover:text-[var(--text-main)] hover:underline"
                  >
                    Online-Widerruf
                  </Link>
                </div>

                {/* App Version Badge */}
                <div className="pt-2 text-center border-t border-[var(--border)] opacity-70">
                  <span className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] bg-[var(--bg-alt)] px-3 py-1 rounded-full border border-[var(--border)]">
                    Flow der Stille v{APP_VERSION}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      <AdminTools />
      <NewContentNotification />
      <PlayStoreUpdateModal />
      <NamePromptModal />
      <AdminWelcomeModal />

    </div>
  );
}

function NavLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 transition-colors w-full ${
        isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
      }`}
    >
      <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[var(--accent)]/10' : ''}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
      </div>
      <span className="text-[9px] font-semibold tracking-wide uppercase text-center">{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-colors ${
        isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
      }`}
    >
      <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
      </div>
      <span className="text-[9px] font-semibold tracking-wide uppercase">{label}</span>
    </Link>
  );
}
