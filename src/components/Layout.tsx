import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wind, Utensils, BookOpen, Settings, Leaf, Globe, LogIn, LogOut, MessageCircle, Moon, Sun, ShoppingBag, Share, X } from 'lucide-react';
import HomeChatWidget from './HomeChatWidget';
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
      setIsShareModalOpen(true);
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
          <NavLink to="/premium" icon={<ShoppingBag />} label="Premium" />
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-6 items-center w-full">
          
          {user && (
            <Link 
              to="/settings"
              className="p-2 rounded-xl hover:bg-[var(--color-bg-border)] transition-colors text-[var(--color-text-muted-light)] hover:text-[var(--color-text-muted)] flex flex-col items-center gap-1"
            >
              <Settings size={24} />
              <span className="text-[10px] font-medium tracking-wide uppercase">{t('nav.settings')}</span>
            </Link>
          )}

          {!user && (
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

          {!user && <NavLink to="/settings" icon={<Settings />} label={t('nav.settings')} />}

        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)]/80 backdrop-blur-md border-t border-[var(--color-border-main)] px-2 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex justify-around items-center z-50 overflow-x-auto gap-2">
        <NavLink to="/" icon={<Home />} label={t('nav.home')} mobile />
        <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} mobile />
        <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} mobile />
        <NavLink to="/learn" icon={<BookOpen />} label={t('nav.learn')} mobile />
        <NavLink to="/premium" icon={<ShoppingBag />} label="Premium" mobile />
        <NavLink to="/settings" icon={<Settings />} label={t('nav.settings')} mobile />
        
        {!user && (
           <Link to="/login" className="flex flex-col items-center gap-1 min-w-[50px]">
             <div className="p-2 rounded-xl text-[var(--color-text-muted-light)]">
               <LogIn size={24} />
             </div>
             <span className="text-[10px] font-medium tracking-wide uppercase text-[var(--color-text-muted-light)]">{t('auth.login')}</span>
           </Link>
        )}
      </nav>

      {/* Floating Chat Button */}
      {location.pathname !== '/chat' && (
        <>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[var(--color-accent-primary)] text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
          >
            {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </button>

          {isChatOpen && (
            <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+7rem)] right-4 md:bottom-24 md:right-8 w-[calc(100vw-2rem)] md:w-96 h-[60vh] md:h-[500px] z-50">
               <HomeChatWidget onClose={() => setIsChatOpen(false)} />
            </div>
          )}
        </>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}>
          <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl w-full max-w-sm shadow-xl border border-[var(--color-border-main)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[var(--color-text-main)]">Folgen & Teilen</h3>
              <button className="p-2 rounded-full hover:bg-[var(--color-bg-border)]" onClick={() => setIsShareModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="flex flex-col gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] text-center font-bold hover:bg-[var(--color-bg-border)] transition-colors">Instagram</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] text-center font-bold hover:bg-[var(--color-bg-border)] transition-colors">TikTok</a>
              <button 
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link in die Zwischenablage kopiert!');
                    setIsShareModalOpen(false);
                }}
                className="p-4 rounded-xl bg-[var(--color-accent-primary)] text-white text-center font-bold hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Link kopieren
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        <footer className="mt-20 pt-8 border-t border-[var(--color-border-main)] text-center pb-24 md:pb-8 flex flex-wrap items-center justify-center gap-2">
          <Link to="/impressum" className="px-3 py-1.5 bg-[var(--color-bg-alt)] rounded-full text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-main)] hover:bg-[var(--color-border-main)] transition-colors whitespace-nowrap">Impressum</Link>
          <Link to="/datenschutz" className="px-3 py-1.5 bg-[var(--color-bg-alt)] rounded-full text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-main)] hover:bg-[var(--color-border-main)] transition-colors whitespace-nowrap">Datenschutz</Link>
          <Link to="/agb" className="px-3 py-1.5 bg-[var(--color-bg-alt)] rounded-full text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-main)] hover:bg-[var(--color-border-main)] transition-colors whitespace-nowrap">AGB</Link>
          <Link to="/rechtliches" className="px-3 py-1.5 bg-[var(--color-bg-alt)] rounded-full text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-main)] hover:bg-[var(--color-border-main)] transition-colors whitespace-nowrap">Rechtliches</Link>
          <Link to="/online-widerruf" className="px-3 py-1.5 bg-[var(--color-bg-alt)] rounded-full text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-main)] hover:bg-[var(--color-border-main)] transition-colors whitespace-nowrap">Online-Widerruf</Link>
          <Link to="/konto-loeschen" className="px-3 py-1.5 bg-[var(--color-bg-alt)] rounded-full text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-main)] hover:bg-[var(--color-border-main)] transition-colors whitespace-nowrap">Konto löschen</Link>
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