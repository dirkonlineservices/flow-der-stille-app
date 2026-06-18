import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wind, Utensils, BookOpen, Settings, Leaf, Globe, LogIn, LogOut, MessageCircle, Moon, Sun, ShoppingBag, Share } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { setCartOpen, items } = useCart();
  const cartItemCount = items.length;

  // === NEU: SPA Tracking für Google Tag Manager ===
  useEffect(() => {
    // 1. Sicherstellen, dass der dataLayer existiert
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // 2. Das Event bei jedem Seitenwechsel an den GTM senden
    (window as any).dataLayer.push({
      event: 'virtual_page_view',
      page_path: location.pathname + location.search,
      page_title: document.title || 'Flow der Stille'
    });
  }, [location]); // Löst exakt dann aus, wenn sich die URL ändert
  // =================================================

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flow der Stille',
          text: 'Entdecke Flow der Stille für inneren Frieden.',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link wurde in die Zwischenablage kopiert!');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)] text-[var(--color-text-main)] font-sans pb-24 md:pb-0 md:pl-24 transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 bg-[var(--color-bg-card)]/50 backdrop-blur-sm border-r border-[var(--color-border-main)] z-50 overflow-y-auto">
        <Link to="/" className="mb-10 p-2 rounded-full hover:bg-[var(--color-bg-border)] transition-colors shrink-0">
          <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
        </Link>
        
        <div className="flex flex-col gap-6 w-full">
          <NavLink to="/" icon={<Home />} label={t('nav.home')} />
          <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} />
          <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} />
          <NavLink to="/learn" icon={<BookOpen />} label={t('nav.learn')} />
          <NavLink to="/chat" icon={<MessageCircle />} label="Chat" />
          <NavLink to="/premium" icon={<ShoppingBag />} label="Premium" />
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-6 items-center w-full">
          
          {user ? (
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-[var(--color-bg-border)] transition-colors text-[var(--color-text-muted-light)] hover:text-[var(--color-text-muted)] flex flex-col items-center gap-1"
            >
              <LogOut size={24} />
              <span className="text-[10px] font-medium tracking-wide uppercase">{t('auth.logout')}</span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="p-2 rounded-xl hover:bg-[var(--color-bg-border)] transition-colors text-[var(--color-text-muted-light)] hover:text-[var(--color-text-muted)] flex flex-col items-center gap-1"
            >
              <LogIn size={24} />
              <span className="text-[10px] font-medium tracking-wide uppercase">{t('auth.login')}</span>
            </Link>
          )}

          <button 
            onClick={handleShare}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-border)] transition-colors text-[var(--color-text-muted-light)] hover:text-[var(--color-text-muted)] flex flex-col items-center gap-1"
          >
            <Share size={24} />
            <span className="text-[10px] font-medium tracking-wide uppercase">Teilen</span>
          </button>

          <NavLink to="/settings" icon={<Settings />} label={t('nav.settings')} />
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)]/80 backdrop-blur-md border-t border-[var(--color-border-main)] px-2 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex justify-between items-center z-50 overflow-x-auto gap-2">
        <NavLink to="/" icon={<Home />} label={t('nav.home')} mobile />
        <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} mobile />
        <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} mobile />
        <NavLink to="/learn" icon={<BookOpen />} label={t('nav.learn')} mobile />
        <NavLink to="/chat" icon={<MessageCircle />} label="Chat" mobile />
        <NavLink to="/premium" icon={<ShoppingBag />} label="Premium" mobile />
        <NavLink to="/settings" icon={<Settings />} label={t('nav.settings')} mobile />
        
        {user ? (
           <button onClick={handleLogout} className="flex flex-col items-center gap-1 min-w-[50px]">
             <div className="p-2 rounded-xl text-[var(--color-text-muted-light)]">
               <LogOut size={24} />
             </div>
             <span className="text-[10px] font-medium tracking-wide uppercase text-[var(--color-text-muted-light)]">{t('auth.logout')}</span>
           </button>
        ) : (
           <Link to="/login" className="flex flex-col items-center gap-1 min-w-[50px]">
             <div className="p-2 rounded-xl text-[var(--color-text-muted-light)]">
               <LogIn size={24} />
             </div>
             <span className="text-[10px] font-medium tracking-wide uppercase text-[var(--color-text-muted-light)]">{t('auth.login')}</span>
           </Link>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-12 pt-20 md:pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        
        <footer className="mt-20 pt-8 border-t border-[var(--color-border-main)] text-center text-xs text-[var(--color-text-muted-light)] pb-24 md:pb-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <Link to="/impressum" className="hover:text-[var(--color-text-main)] transition-colors">Impressum</Link>
          <span className="hidden md:inline">•</span>
          <Link to="/datenschutz" className="hover:text-[var(--color-text-main)] transition-colors">Datenschutz</Link>
          <span className="hidden md:inline">•</span>
          <Link to="/agb" className="hover:text-[var(--color-text-main)] transition-colors">AGB</Link>
          <span className="hidden md:inline">•</span>
          <Link to="/rechtliches" className="hover:text-[var(--color-text-main)] transition-colors">Rechtliches</Link>
          <span className="hidden md:inline">•</span>
          <Link to="/online-widerruf" className="hover:text-[var(--color-text-main)] transition-colors">Hier zum Online-Widerruf</Link>
          <span className="hidden md:inline">•</span>
          <Link to="/konto-loeschen" className="hover:text-[var(--color-text-main)] transition-colors">Konto löschen</Link>
        </footer>
      </main>

    </div>
  );
}

function NavLink({ to, icon, label, mobile = false }: { to: string; icon: React.ReactNode; label: string; mobile?: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 transition-colors ${
        isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted-light)] hover:text-[var(--color-text-muted)]'
      }`}
    >
      <div className={`p-2 rounded-xl ${isActive ? 'bg-[var(--color-accent-primary)]/10' : ''}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: mobile ? 24 : 28, strokeWidth: isActive ? 2.5 : 2 })}
      </div>
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </Link>
  );
}