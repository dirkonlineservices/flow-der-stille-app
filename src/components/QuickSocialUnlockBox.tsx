import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, Smartphone } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  returnPath?: string;
  compact?: boolean;
  onSuccess?: () => void;
  showAppPush?: boolean;
}

export default function QuickSocialUnlockBox({
  title = 'Mit 1 Klick gratis freischalten',
  subtitle = 'Registriere dich kostenlos über Google oder Facebook, um sofort vollen Zugriff zu erhalten:',
  returnPath,
  compact = false,
  onSuccess,
  showAppPush = true
}: Props) {
  const location = useLocation();
  const [socialLoading, setSocialLoading] = useState<'facebook' | 'google' | null>(null);

  const targetPath = returnPath || (location.pathname + location.search);

  const handleSocialSignIn = async (provider: 'facebook' | 'google') => {
    setSocialLoading(provider);

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'login_attempt',
        method: `${provider}_sso`,
        source: 'quick_social_unlock_box'
      });
    }

    try {
      const { getSupabase } = await import('../lib/supabaseClient');
      const supabase = getSupabase();
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
      onSuccess?.();
    } catch (err) {
      console.error('Social Login Error:', err);
      setSocialLoading(null);
    }
  };

  return (
    <div className={`w-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs transition-all ${compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-6'}`}>
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <Sparkles size={14} />
          <span>{title}</span>
        </div>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* 1-Klick Buttons: Facebook & Google */}
      <div className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5`}>
        {/* Facebook SSO */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('facebook')}
          disabled={socialLoading !== null}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {socialLoading === 'facebook' ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          <span>Mit Facebook freischalten</span>
        </button>

        {/* Google SSO */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('google')}
          disabled={socialLoading !== null}
          className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] border border-[var(--border)] font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {socialLoading === 'google' ? (
            <span className="w-3.5 h-3.5 border-2 border-[var(--text-main)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          <span>Mit Google freischalten</span>
        </button>
      </div>

      {/* Klassischer E-Mail Registrierungs-Link */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <Link
          to={`/registrieren?redirectTo=${encodeURIComponent(targetPath)}`}
          className="text-[var(--text-muted)] hover:text-[var(--accent)] font-medium inline-flex items-center gap-1 transition-colors hover:underline"
        >
          <Mail size={12} />
          <span>Oder klassisch mit E-Mail registrieren</span>
          <ArrowRight size={11} />
        </Link>

        {showAppPush && (
          <Link
            to="/app"
            className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
          >
            <Smartphone size={11} />
            <span>Oder Android App laden</span>
          </Link>
        )}
      </div>
    </div>
  );
}
