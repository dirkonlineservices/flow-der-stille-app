import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('E-Mail-Adresse wird bestätigt...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Block global UI overlays like Newsletter popups on this route
    sessionStorage.setItem('suppress_newsletter_modal', 'true');

    const supabase = getSupabase();

    const handleAuthCallback = async () => {
      try {
        // Check session from URL hash or storage
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error.message);
          setStatusText('Bestätigung fehlgeschlagen. Bitte versuche es erneut.');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        if (data.session) {
          setIsSuccess(true);
          setStatusText('Erfolgreich bestätigt! Willkommen bei Flow der Stille.');

          // Dispatch dataLayer tracking event (pure JSON only, no DOM or event parameters)
          if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'sign_up',
              method: 'email_double_opt_in',
              status: 'success'
            });
          }

          // Redirect to home or personal area after brief pause
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          // If no session immediately, listen to auth state change or wait briefly
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              setIsSuccess(true);
              setStatusText('Erfolgreich bestätigt! Willkommen bei Flow der Stille.');

              if (typeof window !== 'undefined') {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                  event: 'sign_up',
                  method: 'email_double_opt_in',
                  status: 'success'
                });
              }

              setTimeout(() => {
                navigate('/', { replace: true });
              }, 2000);
            }
          });

          // Fallback timer if no auth event fires within 4 seconds
          const timer = setTimeout(() => {
            navigate('/login', { replace: true });
          }, 4000);

          return () => {
            authListener.subscription.unsubscribe();
            clearTimeout(timer);
          };
        }
      } catch (err) {
        console.error('Unexpected auth callback exception:', err);
        setStatusText('Ein Fehler ist aufgetreten.');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-500"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm text-center flex flex-col items-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-alt)] flex items-center justify-center border border-[var(--border)]">
          {isSuccess ? (
            <CheckCircle2 className="w-8 h-8 text-[var(--accent)] animate-bounce" />
          ) : (
            <Loader2 className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-tight">
            Flow der Stille
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base font-sans">
            {statusText}
          </p>
        </div>

        <div className="w-full bg-[var(--bg-alt)] h-1 rounded-full overflow-hidden">
          <div className="bg-[var(--accent)] h-full transition-all duration-1000 animate-pulse w-3/4 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
}
