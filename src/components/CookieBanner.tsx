import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    // Check local storage first
    const localConsent = localStorage.getItem('cookie_consent');
    if (!localConsent) {
      // If user is authenticated, check their metadata
      if (user) {
        const hasConsented = user.cookie_consent === true || user.cookie_consent === false;
        if (!hasConsented) {
          setIsVisible(true);
        } else {
          localStorage.setItem('cookie_consent', user.cookie_consent ? 'true' : 'false');
        }
      } else {
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleConsent = async (accepted: boolean) => {
    localStorage.setItem('cookie_consent', accepted ? 'true' : 'false');
    setIsVisible(false);

    if (user) {
      await supabase.auth.updateUser({
        data: { cookie_consent: accepted }
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 sm:bottom-6 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:max-w-2xl z-[100] p-4 sm:p-0"
        >
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl shadow-xl p-5 md:p-6 pb-24 md:pb-6">
            <h3 className="font-serif text-[var(--color-text-main)] text-lg mb-2">Cookies & Datenschutz</h3>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">
              Wir verwenden Cookies, um Ihre Einstellungen zu speichern und unsere Website zu verbessern. Sie können Ihre Wahl jederzeit unter den <Link to="/settings" className="text-[var(--color-accent-primary)] hover:underline">Datenschutz-Einstellungen</Link> widerrufen. Weitere Informationen finden Sie in unserer <Link to="/datenschutz" className="text-[var(--color-accent-primary)] hover:underline">Datenschutzerklärung</Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleConsent(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl text-sm font-medium transition-colors"
                id="btn-accept-cookies"
              >
                Alle akzeptieren
              </button>
              <button 
                onClick={() => handleConsent(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-bg-body)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] border border-[var(--color-border-main)] rounded-xl text-sm font-medium transition-colors"
                id="btn-decline-cookies"
              >
                Nur notwendige
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
