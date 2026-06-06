import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wind, Utensils, BookOpen, Settings, Leaf, Globe, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import MusicPlayer from './MusicPlayer';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-warm)] text-[var(--color-text-primary)] font-sans pb-24 md:pb-0 md:pl-24">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 bg-white/50 backdrop-blur-sm border-r border-stone-200 z-50">
        <Link to="/" className="mb-12 p-2 rounded-full hover:bg-stone-100 transition-colors">
          <Leaf className="w-8 h-8 text-[var(--color-accent-olive)]" />
        </Link>
        
        <div className="flex flex-col gap-8">
          <NavLink to="/" icon={<Home />} label={t('nav.home')} />
          <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} />
          <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} />
          <NavLink to="/learn" icon={<BookOpen />} label={t('nav.learn')} />
          <NavLink to="/chat" icon={<MessageCircle />} label="Chat" />
        </div>

        <div className="mt-auto flex flex-col gap-6 items-center">
          <button 
            onClick={toggleLanguage}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">{language === 'en' ? '🇺🇸' : '🇩🇪'}</span>
            <span className="text-[10px] font-medium tracking-wide uppercase">{language.toUpperCase()}</span>
          </button>
          
          {user ? (
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600 flex flex-col items-center gap-1"
            >
              <LogOut size={24} />
              <span className="text-[10px] font-medium tracking-wide uppercase">{t('auth.logout')}</span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600 flex flex-col items-center gap-1"
            >
              <LogIn size={24} />
              <span className="text-[10px] font-medium tracking-wide uppercase">{t('auth.login')}</span>
            </Link>
          )}

          <NavLink to="/settings" icon={<Settings />} label={t('nav.settings')} />
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-stone-200 px-4 py-3 flex justify-between items-center z-50 overflow-x-auto">
        <NavLink to="/" icon={<Home />} label={t('nav.home')} mobile />
        <NavLink to="/exercises" icon={<Wind />} label={t('nav.breathe')} mobile />
        <NavLink to="/recipes" icon={<Utensils />} label={t('nav.nourish')} mobile />
        <NavLink to="/chat" icon={<MessageCircle />} label="Chat" mobile />
        
        {user ? (
           <button onClick={handleLogout} className="flex flex-col items-center gap-1 min-w-[60px]">
             <div className="p-2 rounded-xl text-stone-400">
               <LogOut size={24} />
             </div>
             <span className="text-[10px] font-medium tracking-wide uppercase text-stone-400">{t('auth.logout')}</span>
           </button>
        ) : (
           <Link to="/login" className="flex flex-col items-center gap-1 min-w-[60px]">
             <div className="p-2 rounded-xl text-stone-400">
               <LogIn size={24} />
             </div>
             <span className="text-[10px] font-medium tracking-wide uppercase text-stone-400">{t('auth.login')}</span>
           </Link>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-12">
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
      </main>

      <MusicPlayer />
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
        isActive ? 'text-[var(--color-accent-olive)]' : 'text-stone-400 hover:text-stone-600'
      }`}
    >
      <div className={`p-2 rounded-xl ${isActive ? 'bg-[var(--color-accent-olive)]/10' : ''}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: mobile ? 24 : 28, strokeWidth: isActive ? 2.5 : 2 })}
      </div>
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </Link>
  );
}
