import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Sparkles, BookOpen, Clock, ShieldCheck, 
  ListMusic, Bookmark, HardDrive, AlertCircle, Lock, Gift, 
  Headphones, CheckCircle2, X, Smartphone 
} from 'lucide-react';
import SEO from '../components/SEO';
import { AudiobookPlayerModal, AudiobookChapter } from '../components/AudiobookPlayerModal';
import { OfflineDownloadButton } from '../components/OfflineDownloadButton';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { offlineManager } from '../lib/offlineAudioService';
import { getOfflineProductById } from '../lib/offlineProductsService';
import { Browser } from '@capacitor/browser';

export interface FormattedAudiobookChapter extends AudiobookChapter {
  number: string;
  subtitle: string;
}

const SCHMETTERLING_CHAPTERS: FormattedAudiobookChapter[] = [
  { 
    id: 'intro', 
    number: 'Einleitung',
    title: 'Rechtlicher Hinweis und Einstimmung', 
    subtitle: 'Wichtige Orientierung vor Beginn der Hörreise',
    startTime: 0, 
    formattedTime: '00:00',
    duration: '1:19 Min.'
  },
  { 
    id: 'ch1', 
    number: 'Kapitel 1',
    title: 'Warum der Übergang erst der Anfang ist', 
    subtitle: 'Wie wir die Angst vor dem Wandel verlieren',
    startTime: 79, 
    formattedTime: '01:19',
    duration: '17:48 Min.'
  },
  { 
    id: 'ch2', 
    number: 'Kapitel 2',
    title: 'Der Übergang', 
    subtitle: 'Wenn Wissenschaft auf Spiritualität trifft',
    startTime: 1147, 
    formattedTime: '19:07',
    duration: '17:10 Min.'
  },
  { 
    id: 'ch3', 
    number: 'Kapitel 3',
    title: 'Die andere Ebene', 
    subtitle: 'Jenseits des schweren Kostüms',
    startTime: 2177, 
    formattedTime: '36:17',
    duration: '13:18 Min.'
  },
  { 
    id: 'ch4', 
    number: 'Kapitel 4',
    title: 'Das Erwachen im Hier und Jetzt', 
    subtitle: 'Die Befreiung zum bewussten Leben',
    startTime: 2975, 
    formattedTime: '49:35',
    duration: '9:08 Min.'
  },
];

const MENSCH_SEIN_CHAPTERS: FormattedAudiobookChapter[] = [
  { 
    id: 'intro', 
    number: 'Einleitung',
    title: 'Einleitung und rechtlicher Hinweis', 
    subtitle: 'Wichtige Orientierung vor Beginn der Hörreise',
    startTime: 0, 
    formattedTime: '00:00',
    duration: '1:09 Min.'
  },
  { 
    id: 'ch1', 
    number: 'Kapitel 1',
    title: 'Die Fassade bröckelt – Was bedeutet es, echt zu sein?', 
    subtitle: 'Der Mut, Masken abzulegen und zu sich selbst zu stehen',
    startTime: 69, 
    formattedTime: '01:09',
    duration: '11:00 Min.'
  },
  { 
    id: 'ch2', 
    number: 'Kapitel 2',
    title: 'Der spirituelle Werkzeugkasten – Bewusstsein mit Humor', 
    subtitle: 'Leichtigkeit und Achtsamkeit im Alltag integrieren',
    startTime: 729, 
    formattedTime: '12:09',
    duration: '8:41 Min.'
  },
  { 
    id: 'ch3', 
    number: 'Kapitel 3',
    title: 'In die Tiefe tauchen – Schatten & alte Muster', 
    subtitle: 'Alte Glaubenssätze erkennen und liebevoll transformieren',
    startTime: 1250, 
    formattedTime: '20:50',
    duration: '8:46 Min.'
  },
  { 
    id: 'ch4', 
    number: 'Kapitel 4',
    title: 'Die innere Ausrichtung – Klarheit, Willenskraft & Wege', 
    subtitle: 'Den inneren Kompass neu justieren und fokussieren',
    startTime: 1776, 
    formattedTime: '29:36',
    duration: '8:39 Min.'
  },
  { 
    id: 'ch5', 
    number: 'Kapitel 5',
    title: 'Die große Ausrichtung – Sehnsucht & Freiheit', 
    subtitle: 'Den eigenen Herzensweg mutig und frei beschreiten',
    startTime: 2295, 
    formattedTime: '38:15',
    duration: '8:40 Min.'
  },
  { 
    id: 'ch6', 
    number: 'Kapitel 6',
    title: 'Die Heimkehr ins Herz – Kraft bündeln & Wirken', 
    subtitle: 'Ganz bei dir ankommen und aus dem Herzen leben',
    startTime: 2815, 
    formattedTime: '46:55',
    duration: '8:44 Min.'
  },
  { 
    id: 'outro', 
    number: 'Klangreise',
    title: 'Klassisches Musikstück – Vollständiger Ausklang', 
    subtitle: 'Hinterlegtes Musikstück zum Nachspüren und Entspannen',
    startTime: 3339, 
    formattedTime: '55:39',
    duration: '3:00 Min.'
  }
];

export default function AudiobookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPurchasedRedirect = searchParams.get('purchased') === 'true';
  const shouldAutoPlay = searchParams.get('play') === 'true' || isPurchasedRedirect;
  const [showPurchaseCelebration, setShowPurchaseCelebration] = useState(isPurchasedRedirect);

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Kauf- und Besitzstatus
  const [isOwned, setIsOwned] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedLockedChapter, setSelectedLockedChapter] = useState<FormattedAudiobookChapter | null>(null);

  // Disclaimer-Status (Erst nach 1:19 Min. darf in den Kapiteln gehüpft werden)
  const productId = id || 'fds_hoerbuch_schmetterling';
  const DISCLAIMER_KEY = `fds_audiobook_disclaimer_listened_${productId}`;
  const [hasListenedDisclaimer, setHasListenedDisclaimer] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage?.getItem(DISCLAIMER_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [initialChapterTime, setInitialChapterTime] = useState<number>(0);
  const [showDisclaimerRequiredModal, setShowDisclaimerRequiredModal] = useState<boolean>(false);
  const [savedProgressTime, setSavedProgressTime] = useState<number | null>(null);

  // Gespeicherten Hörfortschritt für dieses Buch auslesen
  useEffect(() => {
    try {
      const activeId = productData?.id || productId || '';
      const raw = localStorage.getItem(`fds_audiobook_progress_${activeId}`) ||
                  (activeId.startsWith('fds_') 
                    ? localStorage.getItem(`fds_audiobook_progress_${activeId.replace('fds_', '')}`) 
                    : localStorage.getItem(`fds_audiobook_progress_fds_${activeId}`));
      if (raw) {
        const val = parseFloat(raw);
        if (!isNaN(val) && val > 5) {
          setSavedProgressTime(val);
        } else {
          setSavedProgressTime(null);
        }
      } else {
        setSavedProgressTime(null);
      }
    } catch {}
  }, [productData, productId, isPlayerOpen]);

  // 90 Sekunden Hörprobe (ab 1:19 Min. = 79 Sek.)
  const SNIPPET_START_TIME = 79;
  const SNIPPET_DURATION = 90;
  const [isPlayingSnippet, setIsPlayingSnippet] = useState(false);
  const [snippetCurrentTime, setSnippetCurrentTime] = useState(79);
  const snippetAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadAudiobook() {
      setLoading(true);
      setLoadError(null);

      // 1. Zuerst sofort aus Offline-Katalog laden (Flugmodus-Schutz)
      const offlineProd = getOfflineProductById(productId || 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte');
      if (offlineProd) {
        setProductData(offlineProd);
      }

      // 2. Offline-Kaufstatus sofort prüfen
      const isOfflineOwned = offlineManager.isPurchasedOffline(productId || 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte') ||
                             offlineManager.isPurchasedOffline('schmetterling') ||
                             offlineManager.isPurchasedOffline('fds_schmetterling');
      if (isOfflineOwned) {
        setIsOwned(true);
        if (shouldAutoPlay) {
          setIsPlayerOpen(true);
        }
      }

      try {
        const supabase = getSupabase();
        const isDefaultSchmetterling = !productId || productId === 'fds_hoerbuch_schmetterling' || productId === 'schmetterling' || productId === 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte';
        let query = supabase.from('produkte').select('*');
        if (!isDefaultSchmetterling) {
          query = query.eq('id', productId);
        } else {
          query = query.or(`id.eq.${productId},titel.ilike.%schmetterling%`);
        }

        const res: any = await Promise.race([
          query.limit(1).maybeSingle(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Audiobook Timeout')), 3000))
        ]);

        const { data, error } = res || {};

        if (!error && data) {
          setProductData(data);

          // Kaufstatus für diesen Nutzer prüfen
          if (user) {
            setCheckingOwnership(true);
            try {
              const { data: purchaseData } = await Promise.race([
                supabase
                  .from('kaeufe')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('produkt_id', data.id)
                  .maybeSingle(),
                new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2500))
              ]);

              const hasPurchased = !!purchaseData || isOfflineOwned;
              setIsOwned(hasPurchased);
              if (hasPurchased) {
                offlineManager.savePurchasedProducts([data.id, 'schmetterling', 'fds_schmetterling']);
              }
              if (hasPurchased && shouldAutoPlay) {
                setIsPlayerOpen(true);
              }
            } catch {
              // Netzwerkfehler bei Kaufstatusprüfung: Offline-Status beibehalten
              setIsOwned(isOfflineOwned);
            } finally {
              setCheckingOwnership(false);
            }
          }
        } else if (!offlineProd) {
          setLoadError('Das gewünschte Hörbuch wurde nicht gefunden.');
        }
      } catch (e) {
        console.log('[OfflineMode] Verwende Offline-Hörbuchdaten');
        if (!offlineProd) {
          setLoadError('Verbindungsfehler beim Laden des Hörbuchs.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadAudiobook();
  }, [productId, user]);

  const isMenschSein = Boolean(
    (productData?.id && (productData.id.includes('mensch_sein') || productData.id.includes('echtsein'))) || 
    (productId && (productId.includes('mensch_sein') || productId.includes('echtsein')))
  );
  const coverImage = isMenschSein ? '/images/products/cover_mensch_sein.jpg?v=2' : '/images/products/cover_schmetterling.jpg';
  const chapters = isMenschSein ? MENSCH_SEIN_CHAPTERS : SCHMETTERLING_CHAPTERS;
  const title = productData?.titel || (isMenschSein ? 'Mut zum Echtsein - Was steckt hinter einem echtem Menschen' : 'Der Tag, an dem der Schmetterling erwachte');
  const audioUrl = productData?.audio_path || productData?.audio_url || productData?.hoerprobe_url || '';
  const priceDisplay = productData?.preis ? `${productData.preis} €` : '4,99 €';

  // Hörproben-Steuerung
  const togglePlaySnippet = () => {
    const audio = snippetAudioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlayingSnippet(false);
    } else {
      if (audio.currentTime < SNIPPET_START_TIME || audio.currentTime >= SNIPPET_START_TIME + SNIPPET_DURATION) {
        audio.currentTime = SNIPPET_START_TIME;
        setSnippetCurrentTime(SNIPPET_START_TIME);
      }
      audio.play().then(() => setIsPlayingSnippet(true)).catch(() => {});
    }
  };

  const [socialLoading, setSocialLoading] = useState(false);

  const handleSocialSignIn = async (provider: 'facebook' | 'google') => {
    if (socialLoading) return;
    setSocialLoading(true);

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ 
        event: 'login_attempt', 
        method: `${provider}_sso`,
        source: 'audiobook_quick_unlock'
      });
    }

    try {
      const supabase = getSupabase();
      const isNative = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('auth_return_url', currentPath);

      const redirectTo = isNative
        ? 'app.flowderstille.de://auth/callback'
        : `${window.location.origin}/auth/callback`;

      if (isNative) {
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
      console.error('SSO Error:', err);
      setSocialLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const audiobookSchema = {
    "@context": "https://schema.org",
    "@type": ["Product", "Audiobook", "Book"],
    "name": title,
    "description": productData?.beschreibung || "Ganzheitliches Hörbuch über innere Verwandlung, Achtsamkeit und Bewusstsein von Jacqueline Schmetzer.",
    "image": coverImage.startsWith('http') ? coverImage : `https://flow-der-stille.de${coverImage}`,
    "author": {
      "@type": "Person",
      "name": "Jacqueline Schmetzer"
    },
    "readBy": {
      "@type": "Person",
      "name": "Lisa Ragusa"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Flow der Stille",
      "url": "https://flow-der-stille.de"
    },
    "inLanguage": "de-DE",
    "duration": isMenschSein ? "PT58M39S" : "PT58M43S",
    "sku": isMenschSein ? "fds_mensch_sein" : "fds_schmetterling",
    "brand": {
      "@type": "Brand",
      "name": "Flow der Stille"
    },
    "offers": {
      "@type": "Offer",
      "url": isMenschSein ? "https://flow-der-stille.de/hoerbuch/mensch_sein" : "https://flow-der-stille.de/hoerbuch/schmetterling",
      "priceCurrency": "EUR",
      "price": "4.99",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Flow der Stille",
        "url": "https://flow-der-stille.de"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0.00",
          "currency": "EUR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "DE"
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "DE",
        "returnPolicyCategory": "https://schema.org/DigitalContentWaiverReturnPolicy",
        "merchantReturnLink": "https://flow-der-stille.de/rueckgaberichtlinie"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans py-6 px-4 sm:py-10 selection:bg-[var(--accent)] selection:text-white">
      <SEO
        title={`${title} – Flow der Stille`}
        description="Ganzheitliches Hörbuch über innere Verwandlung und Achtsamkeit von Jacqueline Schmetzer."
        image={coverImage}
        schemaJson={audiobookSchema}
      />

      {/* Audio-Element für die 90s Hörprobe ab 1:19 Min. */}
      {audioUrl && (
        <audio
          ref={snippetAudioRef}
          src={audioUrl}
          preload="none"
          onTimeUpdate={() => {
            if (snippetAudioRef.current) {
              const cur = snippetAudioRef.current.currentTime;
              setSnippetCurrentTime(cur);
              if (cur >= SNIPPET_START_TIME + SNIPPET_DURATION) {
                snippetAudioRef.current.pause();
                snippetAudioRef.current.currentTime = SNIPPET_START_TIME;
                setSnippetCurrentTime(SNIPPET_START_TIME);
                setIsPlayingSnippet(false);
              }
            }
          }}
          onEnded={() => {
            setIsPlayingSnippet(false);
            setSnippetCurrentTime(SNIPPET_START_TIME);
          }}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Erfolgsmeldung nach Kaufabschluss */}
        {showPurchaseCelebration && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-xs sm:text-sm block">Herzlichen Glückwunsch zum Kauf!</span>
                <span className="text-[11px] sm:text-xs opacity-90 block">Dein Hörbuch wurde erfolgreich freigeschaltet. Der Player und alle Kapitel stehen dir ab sofort bereit.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPurchaseCelebration(false)}
              className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-500/10 cursor-pointer transition-colors shrink-0"
              title="Meldung schließen"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Back Button */}
        <Link
          to="/hoerbuecher"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Zurück zur Hörbuch-Übersicht</span>
        </Link>

        {/* Hero Card */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-xl flex flex-col md:flex-row gap-8 items-center">
          {/* Cover Image */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--border)] shrink-0 relative group">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Details & Primary Play / Buy Button */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
                <BookOpen size={14} />
                <span>Hörbuch • {isMenschSein ? '58:39 Minuten' : '58:43 Minuten'}</span>
              </span>

              {isOwned ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={13} />
                  <span>In deiner Bibliothek freigeschaltet</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <Lock size={12} />
                  <span>Einmalig {priceDisplay} • Kein Abo</span>
                </span>
              )}
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--text-main)] leading-tight">
              {title}
            </h1>

            <p className="text-xs text-[var(--text-muted)] font-medium">
              Autorin: <strong className="text-[var(--text-main)]">Jacqueline Schmetzer</strong> • Sprecherin: <strong className="text-[var(--text-main)]">Lisa Ragusa</strong>
            </p>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
              {productData?.beschreibung || 'Eine Geschichte über den Wandel des Lebens, die Raum für Trost, Zuversicht und tiefen Frieden schenkt. Sie begleitet dich dabei, dem Thema Abschied mit mehr innerer Ruhe und Vertrauen zu begegnen.'}
            </p>

            {/* Fehlerhinweis falls keine Audio-URL vorliegt */}
            {loadError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Audio-Inhalt momentan nicht verfügbar</p>
                  <p className="mt-0.5 text-xs opacity-90">
                    {loadError} Wende dich gerne an unseren Support unter{' '}
                    <a href="mailto:support@flow-der-stille.de" className="underline font-medium hover:opacity-80">support@flow-der-stille.de</a>.
                  </p>
                </div>
              </div>
            )}

            {/* Kauf- und Play-Steuerung basierend auf Besitzstatus */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-3">
              {isOwned ? (
                /* Fall 1: Produkt GEKAUFT -> Voller Zugriff auf das Hörbuch */
                <>
                  <button
                    onClick={() => {
                      if (!audioUrl) return;
                      setInitialChapterTime(hasListenedDisclaimer && savedProgressTime ? savedProgressTime : 0);
                      setIsPlayerOpen(true);
                    }}
                    disabled={!audioUrl}
                    className="flex-1 py-3.5 px-6 rounded-2xl font-semibold transition-all shadow-md active:scale-95 flex flex-col items-center justify-center text-center min-h-[64px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Play size={16} className="fill-white" />
                      <span>
                        {!hasListenedDisclaimer 
                          ? 'Hörbuch starten (mit rechtlichem Hinweis)' 
                          : savedProgressTime
                          ? `Hörbuch fortsetzen (bei ${formatTime(savedProgressTime)})`
                          : 'Vollständiges Hörbuch abspielen'}
                      </span>
                    </div>
                    <span className="text-[11px] opacity-90 font-normal mt-0.5">
                      {!hasListenedDisclaimer
                        ? `${isMenschSein ? '1:08' : '1:19'} Min. Hinweis anhören, danach freies Kapitel-Hüpfen`
                        : savedProgressTime
                        ? `Ab Minute ${formatTime(savedProgressTime)} weiterhören • Position gespeichert`
                        : `${isMenschSein ? '58:39' : '58:43'} Min. • Alle Kapitel & freies Spulen aktiv`}
                    </span>
                  </button>

                  {audioUrl && (
                    <div className="flex-1 min-h-[64px] flex flex-col justify-center">
                      <OfflineDownloadButton
                        productId={productData?.id || productId}
                        audioUrl={audioUrl}
                        title={title}
                        variant="button"
                      />
                    </div>
                  )}
                </>
              ) : (
                /* Fall 2: Produkt NOCH NICHT GEKAUFT -> Kapitel 1 kostenlos abspielen ODER Vollversion freischalten */
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!audioUrl) return;
                      setInitialChapterTime(0);
                      setIsPlayerOpen(true);
                    }}
                    className="flex-1 py-3.5 px-6 rounded-2xl font-semibold transition-all shadow-md active:scale-95 flex flex-col items-center justify-center text-center min-h-[64px] bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Play size={16} className="fill-white" />
                      <span>Kapitel 1 jetzt kostenlos anhören</span>
                    </div>
                    <span className="text-[11px] opacity-90 font-normal mt-0.5">
                      {isMenschSein ? '11:00 Min.' : '17:05 Min.'} Vollversion des 1. Kapitels gratis
                    </span>
                  </button>

                  <Link
                    to={`/premium#product-${productData?.id || productId}`}
                    className="sm:w-auto px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-md active:scale-95 flex flex-col items-center justify-center text-center min-h-[64px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                      <Gift size={15} />
                      <span>Hörbuch für {priceDisplay} freischalten</span>
                    </div>
                    <span className="text-[10px] opacity-90 font-normal mt-0.5">
                      Alle {chapters.length} Kapitel • Kein Abo
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* 🚀 Conversion-Hebel für Werbebesucher: Kapitel 1 kostenlos mit 1 Klick freischalten */}
            {!user && !isOwned && (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)]/80 border border-[var(--border)] space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/15 text-[#1877F2] flex items-center justify-center shrink-0">
                    <Sparkles size={13} />
                  </span>
                  <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                    Kapitel 1 (17 Minuten) gratis freischalten
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Mit 1 Klick registrieren und das gesamte 1. Kapitel sofort in voller Länge anhören – 100% kostenlos &amp; unverbindlich:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Facebook Quick Login */}
                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('facebook')}
                    disabled={socialLoading}
                    className="py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="white">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Mit Facebook gratis freischalten</span>
                  </button>

                  {/* Google Quick Login */}
                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('google')}
                    disabled={socialLoading}
                    className="py-3 px-4 rounded-xl bg-white dark:bg-stone-800 border border-[var(--border)] hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Mit Google gratis freischalten</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 90 Sekunden Hörproben-Statusleiste wenn aktiv */}
        {isPlayingSnippet && !isOwned && (
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)] shadow-md flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlaySnippet}
                className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Pause size={18} />
              </button>
              <div>
                <span className="text-xs font-semibold text-[var(--text-main)] block">
                  Kostenlose Hörprobe läuft (Kapitel 1)
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {formatTime(Math.max(0, snippetCurrentTime - SNIPPET_START_TIME))} / {formatTime(SNIPPET_DURATION)}
                </span>
              </div>
            </div>

            <Link
              to={`/premium#product-${productData?.id || productId}`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>Vollständiges Hörbuch kaufen</span>
              <ArrowLeft size={12} className="rotate-180" />
            </Link>
          </div>
        )}

        {/* 📱 Mobiler Download-Push: Besucher von Facebook/Social direkt zum App-Download einladen */}
        {typeof window !== 'undefined' && !Boolean((window as any).Capacitor?.isNativePlatform?.()) && (
          <div className="bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-alt)] rounded-3xl p-6 sm:p-7 border border-[var(--border)] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Smartphone size={13} />
                <span>Kostenlose Android App</span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)] leading-tight">
                Dieses Hörbuch &amp; alle Meditationen in der App hören
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-xl">
                Genieße die Hörprobe und deine Inhalte mit <strong className="text-[var(--text-main)]">Hintergrund-Wiedergabe bei gesperrtem Bildschirm</strong>, ohne Browser-Unterbrechungen und mit Offline-Download für unterwegs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <a
                href="https://play.google.com/store/apps/details?id=app.flowderstille.de"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).dataLayer) {
                    (window as any).dataLayer.push({
                      event: 'app_download_click',
                      source: 'audiobook_page_push',
                      destination: 'google_play_store'
                    });
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Im Google Play Store laden</span>
                <ArrowLeft size={14} className="rotate-180" />
              </a>

              <Link
                to="/app"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:underline transition-colors py-1"
              >
                Mehr Infos zur App
              </Link>
            </div>
          </div>
        )}

        {/* Chapters Overview: Harmonisches & synchrones Layout */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="font-serif font-semibold text-xl text-[var(--text-main)] flex items-center gap-2">
                <ListMusic size={20} className="text-[var(--accent)]" />
                <span>Kapitelübersicht und Zeitstrahl</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isOwned 
                  ? 'Klicke auf ein Kapitel, um direkt zu diesem Abschnitt zu springen.'
                  : 'Schalte das Hörbuch frei, um alle Kapitel unbegrenzt anzuhören.'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--bg-alt)] px-3 py-1.5 rounded-full border border-[var(--border)] self-start sm:self-auto">
              {chapters.length} Abschnitte • {isMenschSein ? '58:39 Min.' : '58:43 Min.'}
            </span>
          </div>

          {/* Hinweis wenn Disclaimer noch nicht angehört wurde – Hoher Kontrast für optimale Lesbarkeit */}
          {isOwned && !hasListenedDisclaimer && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-950 dark:text-amber-200 mt-0.5 shadow-xs">
                <Lock size={16} />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-stone-950 dark:text-amber-50 block text-xs sm:text-sm">
                  Einmaliger rechtlicher Hinweis erforderlich (00:00 bis {isMenschSein ? '01:08' : '01:19'} Min.)
                </span>
                <span className="text-xs text-stone-800 dark:text-amber-200/95 font-medium block leading-relaxed">
                  Bitte lausche zu Beginn der Einleitung einmalig bis zum Ende ({isMenschSein ? '1:08' : '1:19'} Min.). Erst danach werden alle weiteren Kapitel zur Direktauswahl freigeschaltet.
                </span>
              </div>
            </div>
          )}

          {/* Saubere Liste der Kapitel */}
          <div className="space-y-3">
            {chapters.map((ch, idx) => {
              const disclaimerThreshold = isMenschSein ? 69 : 79;
              const isFreeChapter = ch.id === 'intro' || ch.id === 'ch1' || idx <= 1;
              const isLockedByDisclaimer = isOwned && !hasListenedDisclaimer && ch.id !== 'intro' && ch.startTime >= disclaimerThreshold;
              const isLockedByPurchase = !isOwned && !isFreeChapter;
              const isAvailable = isOwned ? (hasListenedDisclaimer || ch.id === 'intro') : isFreeChapter;

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    if (isLockedByPurchase) {
                      setSelectedLockedChapter(ch);
                      setShowBuyModal(true);
                    } else if (isLockedByDisclaimer) {
                      setSelectedLockedChapter(ch);
                      setShowDisclaimerRequiredModal(true);
                    } else {
                      setInitialChapterTime(ch.startTime);
                      setIsPlayerOpen(true);
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer ${
                    isAvailable
                      ? 'bg-[var(--bg-alt)] border-[var(--border)] hover:border-[var(--accent)] hover:shadow-xs'
                      : 'bg-[var(--bg-alt)]/60 border-[var(--border)] opacity-85 hover:border-amber-400/60'
                  }`}
                >
                  {/* Titel und Untertitel sauber untereinander */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--accent)]/20">
                        {ch.number}
                      </span>
                      {isFreeChapter && !isOwned && (
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/25">
                          Kostenlos
                        </span>
                      )}
                      <h4 className="font-semibold text-sm sm:text-base text-[var(--text-main)]">
                        {ch.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] italic pl-1">
                      {ch.subtitle}
                    </p>
                  </div>

                  {/* Zeit, Dauer und Status sauber rechts ausgerichtet */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                    <div className="text-left sm:text-right font-mono text-xs">
                      <span className="font-semibold text-[var(--text-main)] block">
                        Start: {ch.formattedTime}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                        Dauer: {ch.duration}
                      </span>
                    </div>

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isAvailable
                        ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--accent)]'
                        : 'bg-amber-100/90 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-200'
                    }`}>
                      {isAvailable ? <Play size={14} className="fill-current ml-0.5" /> : <Lock size={14} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protection & Quality Note */}
        <div className="p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-start gap-3">
          <ShieldCheck size={20} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-[var(--text-main)] font-semibold block">Geschützter Offline-Speicher</strong>
            <span>
              Nach der Freischaltung kann dieses Hörbuch sicher im internen App-Speicher hinterlegt werden. So steht es dir auch im Flugmodus ohne Internetverbindung zur Verfügung, ohne dass die MP3-Datei frei im Dateisystem liegt.
            </span>
          </div>
        </div>

      </div>

      {/* Disclaimer-Pflicht Modal (wenn Kapitel angeklickt wird, bevor Disclaimer gehört wurde) */}
      {showDisclaimerRequiredModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Lock size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400">
                {selectedLockedChapter?.number || 'Kapitel gesperrt'}
              </span>
              <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">
                Rechtlicher Hinweis erforderlich
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Du musst dir zuerst die Einleitung und den rechtlichen Hinweis ({isMenschSein ? '1:08 Min.' : '1:19 Min.'}) einmalig vollständig anhören. Danach werden alle Kapitel zur Direktauswahl freigeschaltet und du kannst frei in den Kapiteln hüpfen.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowDisclaimerRequiredModal(false);
                  setInitialChapterTime(0);
                  setIsPlayerOpen(true);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={15} className="fill-white" />
                <span>Jetzt Einleitung starten (00:00)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDisclaimerRequiredModal(false)}
                className="text-xs text-[var(--text-muted)] hover:underline pt-1 cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kauf-Hinweis Modal (wenn nicht freigeschaltet und Kapitel angeklickt wird) */}
      {showBuyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] mx-auto flex items-center justify-center">
              <Gift size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[var(--accent)]">
                {selectedLockedChapter?.number || 'Vollversion erforderlich'}
              </span>
              <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">
                {selectedLockedChapter?.title || 'Hörbuch freischalten'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Dieses Kapitel ist Teil des vollständigen Hörbuchs. Schalte das Werk einmalig für <strong>{priceDisplay}</strong> frei, um alle {chapters.length} Kapitel und die vollen {Math.floor((productData?.dauer || (isMenschSein ? 3519 : 3523)) / 60)} Minuten dauerhaft anzuhören.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to={`/premium#product-${productData?.id || productId}`}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift size={15} />
                <span>Jetzt für {priceDisplay} freischalten</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setShowBuyModal(false);
                  togglePlaySnippet();
                }}
                className="w-full py-3 px-5 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] font-semibold text-xs border border-[var(--border)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={13} className="fill-current" />
                <span>Kostenlose 90 Sek. Hörprobe abspielen</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBuyModal(false)}
                className="text-xs text-[var(--text-muted)] hover:underline pt-1 cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vollwertiger Audiobook Player Modal (für Besitzer oder für kostenloses Kapitel 1) */}
      {isPlayerOpen && (
        <AudiobookPlayerModal
          isOpen={isPlayerOpen}
          isOwned={isOwned}
          priceDisplay={priceDisplay}
          onRequirePurchase={(lockedChapter) => {
            if (lockedChapter) setSelectedLockedChapter(lockedChapter as any);
            setShowBuyModal(true);
          }}
          onClose={() => {
            setIsPlayerOpen(false);
            try {
              setHasListenedDisclaimer(localStorage.getItem(DISCLAIMER_KEY) === 'true');
              const activeId = productData?.id || productId || '';
              const raw = localStorage.getItem(`fds_audiobook_progress_${activeId}`) ||
                          (activeId.startsWith('fds_') 
                            ? localStorage.getItem(`fds_audiobook_progress_${activeId.replace('fds_', '')}`) 
                            : localStorage.getItem(`fds_audiobook_progress_fds_${activeId}`));
              if (raw) {
                const val = parseFloat(raw);
                if (!isNaN(val) && val > 5) {
                  setSavedProgressTime(val);
                }
              }
            } catch {}
          }}
          productId={productData?.id || productId}
          title={title}
          author="Jacqueline Schmetzer"
          reader="Lisa Ragusa"
          audioUrl={audioUrl}
          coverImage={coverImage}
          durationSeconds={productData?.dauer || (isMenschSein ? 3519 : 3523)}
          chapters={chapters}
          initialStartTime={hasListenedDisclaimer ? initialChapterTime : 0}
        />
      )}
    </div>
  );
}
