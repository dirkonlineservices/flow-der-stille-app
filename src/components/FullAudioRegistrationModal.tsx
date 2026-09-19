import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, UserPlus, LogIn, X, Lock, CheckCircle2, ArrowLeft, Home } from 'lucide-react';

interface FullAudioRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioTitle?: string;
  durationText?: string;
  title?: string;
  subtitle?: string;
  returnPath?: string;
}

export default function FullAudioRegistrationModal({
  isOpen,
  onClose,
  audioTitle = 'diese Session',
  durationText,
  title,
  subtitle,
  returnPath
}: FullAudioRegistrationModalProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Escape-Taste zum Schließen unterstützen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetPath = returnPath || (location.pathname + location.search);

  const handleRegister = () => {
    onClose();
    navigate(`/registrieren?redirectTo=${encodeURIComponent(targetPath)}`);
  };

  const handleLogin = () => {
    onClose();
    navigate(`/anmelden?redirectTo=${encodeURIComponent(targetPath)}`);
  };

  const handleSocialSignIn = async (provider: 'facebook' | 'google') => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ 
        event: 'login_attempt', 
        method: `${provider}_sso`,
        source: 'full_audio_modal'
      });
    }

    try {
      const supabase = (await import('../lib/supabaseClient')).getSupabase();
      const isNative = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
      sessionStorage.setItem('auth_return_url', targetPath);

      const redirectTo = isNative
        ? 'app.flowderstille.de://auth/callback'
        : `${window.location.origin}/auth/callback`;

      if (isNative) {
        const { Browser } = await import('@capacitor/browser');
        const { data, error: ssoError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'select_account' } : undefined
          }
        });
        if (ssoError) throw ssoError;
        if (data?.url) {
          await Browser.open({ url: data.url, windowName: '_system' });
        }
      } else {
        const { error: ssoError } = await supabase.auth.signInWithOAuth({
          provider,
          options: { 
            redirectTo,
            queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'select_account' } : undefined
          }
        });
        if (ssoError) throw ssoError;
      }
    } catch (err) {
      console.error('Social Login Error:', err);
    }
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-[var(--text-main)] overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--accent)]" />

        {/* Deutlicher Schließen-Button oben rechts */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 rounded-xl hover:bg-[var(--bg-alt)] cursor-pointer flex items-center gap-1 text-xs"
          aria-label="Schließen"
          title="Fenster schließen"
        >
          <span className="hidden sm:inline text-xs font-medium text-[var(--text-muted)]">Schließen</span>
          <X size={20} />
        </button>

        <div className="text-center space-y-4 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] mx-auto flex items-center justify-center border border-[var(--accent)]/30">
            <ShieldCheck size={28} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              {subtitle || 'Rechtliche Absicherung & Haftungsausschluss'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
              {title || 'Möchtest du die gesamte Session kostenlos hören?'}
            </h3>
            {durationText && (
              <p className="text-xs font-mono text-[var(--accent)]">
                Volle Länge: {durationText}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed text-left bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--border)]">
            Du hast gerade die ersten <strong>45 Sekunden</strong> zur Stimmprobe gehört. 
            Da es bei Entspannung und mentalem Wohlbefinden um Gesundheitsthemen geht, gelten in Deutschland besonders strenge Gesetze (u.&nbsp;a. Abgrenzung zur ärztlichen Therapie). Um beide Seiten fair und rechtssicher abzusichern, ist für die vollständige Sitzung eine einmalige, kostenlose Registrierung erforderlich.{' '}
            <Link to="/faq" target="_blank" className="text-[var(--accent)] hover:underline font-medium inline-block">
              Warum genau? (FAQ) →
            </Link>
          </p>

          <div className="space-y-2 text-left text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0" />
              <span>100% kostenlos &amp; unverbindlich – kein Abo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0" />
              <span>Bestätigung des Haftungsausschlusses wird sicher in deinem Profil hinterlegt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0" />
              <span>Sofortiger Zugriff auf alle kostenfreien Vollversionen &amp; Schnupperübungen</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[var(--border)]">
            {/* 1-Klick Social Quick Login im dezenten CI-Stil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-main)] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Mit Google 1-Klick</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignIn('facebook')}
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#1877F2]/60 text-[var(--text-main)] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Mit Facebook 1-Klick</span>
              </button>
            </div>

            <div className="relative my-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <span className="relative px-2 bg-[var(--bg-card)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                oder per E-Mail
              </span>
            </div>

            {/* Primäre Aktionen: Registrierung & Login */}
            <button
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[var(--accent)] text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-[var(--accent-hover)] transition-all cursor-pointer active:scale-95"
            >
              <UserPlus size={16} />
              <span>Mit E-Mail kostenlos registrieren</span>
            </button>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-main)] font-medium text-xs hover:bg-[var(--border)] transition-all cursor-pointer"
            >
              <LogIn size={14} />
              <span>Bereits registriert? Anmelden</span>
            </button>

            {/* Auswegs-Buttons: Zurück zur Startseite oder auf der Seite bleiben & weiterlesen */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleGoHome}
                className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-transparent hover:bg-[var(--bg-alt)] text-[var(--text-main)] font-medium text-xs border border-[var(--border)] transition-all cursor-pointer"
              >
                <Home size={14} className="text-[var(--accent)]" />
                <span>Zurück zur Startseite</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-transparent hover:bg-[var(--bg-alt)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium text-xs border border-[var(--border)] transition-all cursor-pointer"
              >
                <X size={14} />
                <span>Fenster schließen &amp; weiterlesen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
