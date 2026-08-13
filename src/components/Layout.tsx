import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Wind, Utensils, BookOpen, ShoppingBag, X, Menu, 
  Moon, Sun, Settings as SettingsIcon, LogIn, UserCheck, 
  Info, Shield, FileText, Scale, Headphones 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AdminTools } from './AdminTools';
import { ProductDisclaimerTrigger } from './ProductDisclaimerTrigger';
import { getSupabase } from '../lib/supabaseClient';

// 📊 Typsicherer Tracking-Helper für virtuelle Seitenaufrufe (SPA-Ready)
const pushVirtualPageView = (pathname: string, search: string) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'virtual_page_view',
      page_path: pathname + search,
      page_title: document.title || 'Flow der Stille'
    });
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
  const isNativeApp = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());

  // Dynamisch prüfen ob Hörproben in Supabase existieren
  useEffect(() => {
    getSupabase()
      .from('produkte')
      .select('id', { count: 'exact', head: false })
      .not('hoerprobe_url', 'is', null)
      .neq('hoerprobe_url', '')
      .then(({ count }) => {
        if (count && count > 0) setHasHoerproben(true);
      });
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
      
      {/* Top Right Corner Google Play App Button */}
      {!isNativeApp && (
        <a
          href="https://play.google.com/store/apps/details?id=app.flowderstille.de&pcampaignid=web_share"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-4 right-4 md:right-8 z-40 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] text-[var(--text-main)] text-xs font-semibold hover:border-[var(--accent)] hover:bg-[var(--bg-alt)] transition-all shadow-sm"
          title="Flow der Stille Android App im Google Play Store laden"
        >
          <GooglePlayIcon className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline font-medium">Google Play App</span>
        </a>
      )}

      <div className="w-full">
        {/* Desktop Sidebar */}
        <nav aria-label="Hauptnavigation Desktop" className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 bg-[var(--bg-card)] border-r border-[var(--border)] z-50 overflow-y-auto">
          <Link to="/" className="mb-10 p-2 rounded-full hover:bg-[var(--bg-alt)] transition-colors shrink-0">
            <img src="/logo-transparent.png" alt="Logo" className="w-8 h-8" />
          </Link>
          
          <div className="flex flex-col gap-6 w-full">
            <NavLink to="/" icon={<Home />} label={t('nav.home')} onClick={() => handleBottomNavClick('Start')} />
            <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} onClick={() => handleBottomNavClick('Atmen')} />
            <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} onClick={() => handleBottomNavClick('Ernährung')} />
            <NavLink to="/learn" icon={<BookOpen />} label={t('nav.learn')} onClick={() => handleBottomNavClick('Lernen')} />
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
          <MobileNavLink to="/" icon={<Home />} label="Start" onClick={() => handleBottomNavClick('Start')} />
          <MobileNavLink to="/exercises" icon={<Wind />} label="Atmen" onClick={() => handleBottomNavClick('Atmen')} />
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

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto p-6 md:p-12 pt-16 md:pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl mx-auto px-6 md:px-12 mt-12 md:mt-16 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8 border-t border-[var(--border)] flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {[
          { to: '/contact', label: 'Kontakt', isButton: true },
          { to: '/impressum', label: 'Impressum' },
          { to: '/datenschutz', label: 'Datenschutz' },
          { to: '/agb', label: 'AGB' },
          { to: '/rechtliches', label: 'Rechtliches' },
          { to: '/online-widerruf', label: 'Online-Widerruf' },
          { to: '/konto-loeschen', label: 'Konto löschen' }
        ].map((link) => (
          link.isButton ? (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleMenuClick(link.label)}
              className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shadow-xs"
            >
              {link.label}
            </Link>
          ) : (
            <Link 
              key={link.to} 
              to={link.to} 
              onClick={() => handleMenuClick(link.label)}
              className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          )
        ))}
        <ProductDisclaimerTrigger />
      </footer>

      {/* Slide-Up Menü (Drawer) für Mobil & Desktop "Mehr" */}
      <AnimatePresence>
        {isSlideUpOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSlideUpOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Slide-Up Content Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-xl bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-3xl p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto text-[var(--text-main)] flex flex-col gap-6"
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
                  to="/recipes"
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
                  to="/learn"
                  onClick={() => handleMenuClick('Lernen & Wissen')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-alt)] text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--text-main)]">{t('nav.learn')}</div>
                    <div className="text-xs text-[var(--text-muted)]">Wissen & Meditation</div>
                  </div>
                </Link>

                {/* Hörproben - nur anzeigen wenn in Supabase vorhanden */}
                {hasHoerproben && (
                  <Link
                    to="/premium?filter=H%C3%B6rprobe"
                    onClick={() => handleMenuClick('Hörproben')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-amber-400 transition-all text-left shadow-xs group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Headphones size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-main)]">Hörproben</div>
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
                    to="/login"
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
                    to="/rechtliches"
                    onClick={() => handleMenuClick('Rechtliches & KI')}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-medium text-[var(--text-main)]"
                  >
                    <Scale size={16} className="text-[var(--accent)] shrink-0" />
                    <span>Rechtliches & KI</span>
                  </Link>
                </div>

                {/* App Version Badge */}
                <div className="pt-2 text-center border-t border-[var(--border)] opacity-70">
                  <span className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] bg-[var(--bg-alt)] px-3 py-1 rounded-full border border-[var(--border)]">
                    Flow der Stille v4.6.6
                  </span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminTools />

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
