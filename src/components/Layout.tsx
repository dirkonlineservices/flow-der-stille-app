import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wind, Utensils, BookOpen, ShoppingBag, X, Menu, Newspaper } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AdminTools } from './AdminTools';

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

// 📊 Tracking für Footer-Klicks (Wichtig für Looker Studio Conversion-Funnel)
const pushNavigationClick = (label: string) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'navigation_click',
      click_location: 'footer',
      click_text: label
    });
  }
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);

  useEffect(() => {
    pushVirtualPageView(location.pathname, location.search);
  }, [location]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-20 md:pb-0 md:pl-24 transition-colors duration-300 flex flex-col justify-between">
      
      <div className="w-full">
        {/* Desktop Sidebar */}
        <nav aria-label="Hauptnavigation Desktop" className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 bg-[var(--bg-card)] border-r border-[var(--border)] z-50 overflow-y-auto">
          <Link to="/" className="mb-10 p-2 rounded-full hover:bg-[var(--bg-alt)] transition-colors shrink-0">
            <img src="/logo-transparent.png" alt="Logo" className="w-8 h-8" />
          </Link>
          
          <div className="flex flex-col gap-6 w-full">
            <NavLink to="/" icon={<Home />} label={t('nav.home')} />
            <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} />
            <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} />
            <NavLink to="/learn" icon={<BookOpen />} label={t('nav.learn')} />
            <NavLink to="/premium" icon={<ShoppingBag />} label="Premium" />
            <button 
              onClick={() => setIsBurgerMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-[var(--bg-alt)] transition-colors text-[var(--text-muted)] flex flex-col items-center gap-1 w-full"
            >
              <Menu size={24} />
              <span className="text-[10px] font-medium tracking-wide uppercase">Menü</span>
            </button>
          </div>
        </nav>

        {/* Mobile Bottom Bar: FEST verankert, kein horizontales Scrollen */}
        <nav aria-label="Hauptnavigation Mobil" className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)]/90 backdrop-blur-md border-t border-[var(--border)] px-1 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-around items-center z-50">
          <NavLink to="/" icon={<Home />} label={t('nav.home')} mobile />
          <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} mobile />
          <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} mobile />
          <NavLink to="/learn" icon={<BookOpen />} label={t('nav.learn')} mobile />
          <NavLink to="/premium" icon={<ShoppingBag />} label="Premium" mobile />
          <button 
            onClick={() => setIsBurgerMenuOpen(true)}
            className="flex flex-col items-center gap-1 min-w-[50px] text-[var(--text-muted)]"
          >
            <Menu size={22} />
            <span className="text-[9px] font-medium tracking-wide uppercase">Menü</span>
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

      {/* 🛠️ OPTIMIERTER FOOTER: Gleichmäßiges Padding, Flex-Wrap-Kompaktierung */}
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
              onClick={() => pushNavigationClick(link.label)}
              className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shadow-xs"
            >
              {link.label}
            </Link>
          ) : (
            <Link 
              key={link.to} 
              to={link.to} 
              onClick={() => pushNavigationClick(link.label)}
              className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          )
        ))}
      </footer>

      {/* Burger Menu Overlay */}
      {isBurgerMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setIsBurgerMenuOpen(false)}
        >
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl w-full max-w-sm shadow-xl border border-[var(--border)] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-[var(--text-main)]">Menü</h3>
              <button className="text-[var(--text-muted)]" onClick={() => setIsBurgerMenuOpen(false)}><X size={24}/></button>
            </div>
            {user ? (
              <>
                <Link to="/settings" onClick={() => setIsBurgerMenuOpen(false)} className="p-4 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-alt-darker)] border border-[var(--border)] text-center font-bold text-[var(--text-main)] transition-all">
                  {t('nav.settings')}
                </Link>
                <button onClick={() => { logout(); setIsBurgerMenuOpen(false); }} className="p-4 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-alt-darker)] border border-[var(--border)] text-center font-bold text-[var(--text-main)] transition-all">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsBurgerMenuOpen(false)} className="p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-center font-bold text-[var(--text-main)]">
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      )}

      <AdminTools />

    </div>
  );
}

function NavLink({ to, icon, label, mobile = false }: { to: string; icon: React.ReactNode; label: string; mobile?: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-0.5 transition-colors ${
        isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
      } ${mobile ? 'min-w-[60px]' : 'w-full'}`}
    >
      <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[var(--accent)]/10' : ''}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: mobile ? 22 : 24, strokeWidth: isActive ? 2.5 : 2 })}
      </div>
      <span className="text-[9px] font-semibold tracking-wide uppercase text-center">{label}</span>
    </Link>
  );
}