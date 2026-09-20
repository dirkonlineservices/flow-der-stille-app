import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  /** Optionales Produktobjekt zur automatischen Erkennung */
  produkt?: any;
  /** Manuell vorgegebener Preis (z. B. 0, 1.99, 4.99) */
  price?: number | string;
  /** Ist es ein Hörbuch mit Kapiteln? */
  isAudiobook?: boolean;
  /** Ist es ein kostenloses Produkt? */
  isFree?: boolean;
  /** Titel manuell überschreiben */
  title?: string;
  /** Untertitel manuell überschreiben */
  subtitle?: string;
  /** Rückleitungs-Pfad nach SSO */
  returnPath?: string;
  /** Kompakte Ansicht */
  compact?: boolean;
  /** Callback */
  onSuccess?: () => void;
  /** App-Download Hinweis */
  showAppPush?: boolean;
}

export default function QuickSocialUnlockBox({
  produkt,
  price,
  isAudiobook,
  isFree,
  title,
  subtitle,
  returnPath,
  compact = false,
  onSuccess,
  showAppPush = true
}: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const [socialLoading, setSocialLoading] = useState<'facebook' | 'google' | null>(null);

  // 🛡️ Dynamischer Schutz: Eingeloggte Nutzer haben bereits ein Konto.
  // Die 1-Klick-Registrierungsbox fällt bei registrierten Nutzern automatisch komplett raus!
  if (user) {
    return null;
  }

  // 1. Automatische Erkennung des Produkttyps
  const isAudiobookDetermined = isAudiobook ?? Boolean(
    produkt?.kategorie?.toLowerCase?.().includes('hörbuch') ||
    produkt?.titel?.toLowerCase?.().includes('hörbuch') ||
    produkt?.id?.includes('hoerbuch') ||
    produkt?.id?.includes('mensch_sein') ||
    produkt?.id?.includes('schmetterling')
  );

  const isFreeDetermined = isFree ?? Boolean(
    produkt?.preis === 0 ||
    produkt?.preis === '0' ||
    produkt?.preis === '0.00' ||
    price === 0 ||
    price === '0' ||
    (!produkt?.preis && price === undefined)
  );

  const rawPrice = price ?? produkt?.preis;
  const priceFormatted = rawPrice !== undefined
    ? (typeof rawPrice === 'number' ? `${rawPrice.toFixed(2).replace('.', ',')} €` : String(rawPrice).includes('€') ? rawPrice : `${rawPrice} €`)
    : (isAudiobookDetermined ? '4,99 €' : '1,99 €');

  // 2. Texte nach Kundenwunsch differenzieren (keine Verwirrung bei kostenpflichtigen Produkten!)
  let displayTitle = title;
  let displaySubtitle = subtitle;
  let googleButtonText = 'Mit Google freischalten';
  let facebookButtonText = 'Mit Facebook freischalten';
  let trustNote = 'Rechtssichere Bestätigung des Haftungsausschlusses • Kein Abo';

  if (!displayTitle) {
    if (isFreeDetermined) {
      displayTitle = 'Kostenfrei freischalten (Normalwert 1,99 €)';
    } else if (isAudiobookDetermined) {
      displayTitle = 'Gefällt dir Kapitel 1? Gesamtes Hörbuch freischalten';
    } else {
      displayTitle = 'Kostenlose Hörprobe (25 %) freischalten';
    }
  }

  if (!displaySubtitle) {
    if (isFreeDetermined) {
      displaySubtitle = 'Registriere dich kostenlos mit 1 Klick über Google oder Facebook, um die vollständige Session sofort und dauerhaft anzuhören:';
    } else if (isAudiobookDetermined) {
      displaySubtitle = `Kapitel 1 kannst du oben komplett kostenlos und ohne Anmeldung anhören. Wenn du alle weiteren Kapitel dauerhaft freischalten möchtest, registriere dich mit 1 Klick und sichere dir die Vollversion für einmalig ${priceFormatted} (kein Abo):`;
    } else {
      displaySubtitle = `Registriere dich kostenlos mit 1 Klick, um die ausführliche 25 % Hörprobe direkt anzuhören (Vollversion danach für ${priceFormatted} freischaltbar):`;
    }
  }

  if (isFreeDetermined) {
    googleButtonText = 'Mit Google 1-Klick freischalten';
    facebookButtonText = 'Mit Facebook 1-Klick freischalten';
    trustNote = '100% kostenlos • Kein Abo • Profil hinterlegt Haftungsausschluss rechtssicher';
  } else if (isAudiobookDetermined) {
    googleButtonText = 'Mit Google 1-Klick registrieren';
    facebookButtonText = 'Mit Facebook 1-Klick registrieren';
    trustNote = `Kapitel 1 gratis ohne Anmeldung • Vollversion aller Kapitel für einmalig ${priceFormatted} • Kein Abo`;
  } else {
    googleButtonText = 'Hörprobe mit Google freischalten';
    facebookButtonText = 'Hörprobe mit Facebook freischalten';
    trustNote = 'Unverbindliche Hörprobe • Keine Zahlungsdaten erforderlich';
  }

  const targetPath = returnPath || (location.pathname + location.search);

  const handleSocialSignIn = async (provider: 'facebook' | 'google') => {
    setSocialLoading(provider);

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'login_attempt',
        method: `${provider}_sso`,
        source: 'quick_social_unlock_box',
        product_id: produkt?.id
      });
    }

    try {
      const { getSupabase } = await import('../lib/supabaseClient');
      const supabase = getSupabase();
      const isNative = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
      sessionStorage.setItem('auth_return_url', targetPath);
      localStorage.setItem('flow_disclaimer_accepted', 'true');

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
      <div className="space-y-1 mb-3 text-left">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <Sparkles size={14} className="shrink-0" />
          <span>{displayTitle}</span>
        </div>
        {displaySubtitle && (
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {displaySubtitle}
          </p>
        )}
      </div>

      {/* 1-Klick Buttons in dezenter CI-Farbharmonie (kein grelles Fremdblau) */}
      <div className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5`}>
        {/* Google SSO Button im CI-Stil */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('google')}
          disabled={socialLoading !== null}
          className="w-full py-2.5 px-3 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] hover:border-[var(--accent)] font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {socialLoading === 'google' ? (
            <span className="w-3.5 h-3.5 border-2 border-[var(--text-main)] border-t-transparent rounded-full animate-spin shrink-0" />
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          <span className="truncate">{googleButtonText}</span>
        </button>

        {/* Facebook SSO Button im CI-Stil (dezentes kleines Logo, passend zu den App-Farben) */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('facebook')}
          disabled={socialLoading !== null}
          className="w-full py-2.5 px-3 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] hover:border-[#1877F2]/60 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {socialLoading === 'facebook' ? (
            <span className="w-3.5 h-3.5 border-2 border-[var(--text-main)] border-t-transparent rounded-full animate-spin shrink-0" />
          ) : (
            <svg className="w-3.5 h-3.5 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          <span className="truncate">{facebookButtonText}</span>
        </button>
      </div>

      {/* Transparenter Haftungsausschluss & Kenntnisnahme bei der 1-Klick-Registrierung */}
      <div className="mt-3 p-2.5 rounded-xl bg-[var(--bg-alt)]/70 border border-[var(--border)] text-[11px] text-[var(--text-muted)] space-y-1 text-left">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
          <ShieldCheck size={14} className="text-emerald-700 dark:text-emerald-300 shrink-0" />
          <span>Haftungsausschluss &amp; Nutzungsbedingungen:</span>
        </div>
        <p className="leading-relaxed">
          Mit Klick auf Google oder Facebook bestätigst du, dass du unseren{' '}
          <Link to="/rechtliches#haftungsausschluss" target="_blank" className="text-[var(--accent)] underline font-medium hover:opacity-80">
            Haftungsausschluss
          </Link>{' '}
          (Entspannungsanwendung, kein Heilversprechen, niemals beim Autofahren hören) sowie unsere{' '}
          <Link to="/agb" target="_blank" className="underline hover:opacity-80">AGB</Link> und{' '}
          <Link to="/datenschutz" target="_blank" className="underline hover:opacity-80">Datenschutz</Link>{' '}
          zur Kenntnis genommen hast.
        </p>
      </div>

      {/* Klassischer E-Mail Registrierungs-Link & Android App */}
      <div className="mt-2.5 pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <Link
          to={`/registrieren?redirectTo=${encodeURIComponent(targetPath)}`}
          className="text-[var(--text-muted)] hover:text-[var(--accent)] font-medium inline-flex items-center gap-1 transition-colors hover:underline"
        >
          <Mail size={12} />
          <span>Oder klassisch per E-Mail registrieren</span>
          <ArrowRight size={11} />
        </Link>

        {showAppPush && (
          <Link
            to="/app"
            className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
          >
            <Smartphone size={11} />
            <span>Android App laden</span>
          </Link>
        )}
      </div>
    </div>
  );
}
