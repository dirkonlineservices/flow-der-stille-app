import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Play, Pause, Sparkles, BookOpen, Clock, ShieldCheck, 
  ListMusic, Bookmark, HardDrive, AlertCircle, Lock, Gift, 
  Headphones, CheckCircle2, X, Smartphone, Key, ExternalLink 
} from 'lucide-react';
import SEO from '../components/SEO';
import { AudiobookPlayerModal, AudiobookChapter } from '../components/AudiobookPlayerModal';
import { OfflineDownloadButton } from '../components/OfflineDownloadButton';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { offlineManager } from '../lib/offlineAudioService';
import { getOfflineProductById } from '../lib/offlineProductsService';
import { Browser } from '@capacitor/browser';
import QuickSocialUnlockBox from '../components/QuickSocialUnlockBox';

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

const SEELE_WIND_CHAPTERS: FormattedAudiobookChapter[] = [
  { 
    id: 'disclaimer', 
    number: 'Hinweis',
    title: 'Rechtlicher Hinweis', 
    subtitle: 'Wichtige Einordnung vor Beginn der Hörreise',
    startTime: 0, 
    formattedTime: '00:00',
    duration: '1:27 Min.'
  },
  { 
    id: 'intro', 
    number: 'Einleitung',
    title: 'Einstimmung & Ankommen', 
    subtitle: 'Sanfter Übergang in den Raum der Stille und Geborgenheit',
    startTime: 87, 
    formattedTime: '01:27',
    duration: '4:57 Min.'
  },
  { 
    id: 'ch1', 
    number: 'Kapitel 1',
    title: 'Wenn die Welt stillsteht – Der erste Moment', 
    subtitle: 'Dem Schmerz Raum geben und behutsam ankommen',
    startTime: 384, 
    formattedTime: '06:24',
    duration: '8:20 Min.'
  },
  { 
    id: 'ch2', 
    number: 'Kapitel 2',
    title: 'Die Wellen des Schmerzes verstehen', 
    subtitle: 'Wie Gefühle kommen und wieder sanft abebben dürfen',
    startTime: 884, 
    formattedTime: '14:44',
    duration: '9:44 Min.'
  },
  { 
    id: 'ch3', 
    number: 'Kapitel 3',
    title: 'Das Nervensystem in der Trauer halten', 
    subtitle: 'Körperliche Geborgenheit und Erdung in schweren Zeiten',
    startTime: 1468, 
    formattedTime: '24:28',
    duration: '9:20 Min.'
  },
  { 
    id: 'ch4', 
    number: 'Kapitel 4',
    title: 'Schutzräume im Alltag schaffen', 
    subtitle: 'Grenzen setzen und dir selbst Ruhe schenken',
    startTime: 2028, 
    formattedTime: '33:48',
    duration: '4:49 Min.'
  },
  { 
    id: 'ch5', 
    number: 'Kapitel 5',
    title: 'Erinnerungen als Kraftquelle bewahren', 
    subtitle: 'Die Liebe ehren, die über den Abschied hinaus bleibt',
    startTime: 2317, 
    formattedTime: '38:37',
    duration: '5:10 Min.'
  },
  { 
    id: 'ch6', 
    number: 'Kapitel 6',
    title: 'Ungesagtes und Schuldgefühle auflösen', 
    subtitle: 'Mitgefühl und Vergebung für dich selbst',
    startTime: 2627, 
    formattedTime: '43:47',
    duration: '7:34 Min.'
  },
  { 
    id: 'ch7', 
    number: 'Kapitel 7',
    title: 'Der leise Trost des Windes', 
    subtitle: 'Verbindung spüren, wo Worte nicht mehr hinreichen',
    startTime: 3081, 
    formattedTime: '51:21',
    duration: '5:29 Min.'
  },
  { 
    id: 'ch8', 
    number: 'Kapitel 8',
    title: 'Schritt für Schritt ins Weitergehen', 
    subtitle: 'Neuen Mut fassen, ohne zu vergessen',
    startTime: 3410, 
    formattedTime: '56:50',
    duration: '5:25 Min.'
  },
  { 
    id: 'ch9', 
    number: 'Kapitel 9',
    title: 'Frieden im Herzen finden', 
    subtitle: 'Dankbarkeit und innere Weite zulassen',
    startTime: 3735, 
    formattedTime: '1:02:15',
    duration: '10:10 Min.'
  },
  { 
    id: 'outro', 
    number: 'Outro',
    title: 'Geführte Abschluss-Meditation', 
    subtitle: 'Sanfter Ausklang und heilsame Verankerung im tiefen Frieden',
    startTime: 4345, 
    formattedTime: '1:12:25',
    duration: '13:41 Min.'
  }
];

export default function AudiobookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isPurchasedRedirect = searchParams.get('purchased') === 'true';
  const shouldAutoPlay = searchParams.get('play') === 'true' || searchParams.get('autoplay') === 'true' || isPurchasedRedirect;
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
      const isTargetSeeleWind = Boolean(
        productId && (productId.includes('seele') || productId.includes('wind') || productId.includes('trauer'))
      );
      const isTargetMenschSein = Boolean(
        !isTargetSeeleWind && productId && (productId.includes('mensch') || productId.includes('echt'))
      );
      const normalizedId = isTargetSeeleWind 
        ? 'wo_die_seele_den_wind_beruehrt' 
        : (isTargetMenschSein ? 'mensch_sein' : (productId || 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte'));
      const offlineProd = getOfflineProductById(normalizedId);
      if (offlineProd) {
        setProductData(offlineProd);
      }

      // 2. Offline-Kaufstatus sofort prüfen (differenziert nach Hörbuch!)
      const isOfflineOwned = isTargetSeeleWind
        ? (offlineManager.isPurchasedOffline('wo_die_seele_den_wind_beruehrt') || offlineManager.isPurchasedOffline('fds_seele_wind'))
        : (isTargetMenschSein
          ? (offlineManager.isPurchasedOffline('mensch_sein') || offlineManager.isPurchasedOffline('fds_mensch_sein'))
          : (offlineManager.isPurchasedOffline(productId || 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte') ||
             offlineManager.isPurchasedOffline('schmetterling') ||
             offlineManager.isPurchasedOffline('fds_schmetterling') ||
             offlineManager.isPurchasedOffline('fds_hoerbuch_schmetterling')));

      if (isOfflineOwned) {
        setIsOwned(true);
        if (shouldAutoPlay) {
          setIsPlayerOpen(true);
        }
      } else if (shouldAutoPlay) {
        setInitialChapterTime(0);
        setIsPlayerOpen(true);
      }

      try {
        const supabase = getSupabase();
        const isDefaultSchmetterling = !isTargetSeeleWind && !isTargetMenschSein && (!productId || productId === 'fds_hoerbuch_schmetterling' || productId === 'schmetterling' || productId === 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte');
        let query = supabase.from('produkte').select('*');
        if (isTargetSeeleWind) {
          query = query.or('id.eq.wo_die_seele_den_wind_beruehrt,id.eq.fds_seele_wind,titel.ilike.%seele%');
        } else if (isTargetMenschSein) {
          query = query.or('id.eq.mensch_sein,id.eq.fds_mensch_sein,titel.ilike.%echtsein%');
        } else if (!isDefaultSchmetterling) {
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
              const targetPurchaseIds = isTargetSeeleWind
                ? ['wo_die_seele_den_wind_beruehrt', 'fds_seele_wind']
                : (isTargetMenschSein
                  ? ['mensch_sein', 'fds_mensch_sein']
                  : [data.id, 'schmetterling', 'fds_schmetterling', 'fds_hoerbuch_schmetterling', 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte']);

              const { data: purchaseData } = await Promise.race([
                supabase
                  .from('kaeufe')
                  .select('id')
                  .eq('user_id', user.id)
                  .in('produkt_id', targetPurchaseIds)
                  .maybeSingle(),
                new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2500))
              ]);

              const hasPurchased = !!purchaseData || isOfflineOwned;
              setIsOwned(hasPurchased);
              if (hasPurchased) {
                if (isTargetSeeleWind) {
                  offlineManager.savePurchasedProducts(['wo_die_seele_den_wind_beruehrt', 'fds_seele_wind']);
                } else if (isTargetMenschSein) {
                  offlineManager.savePurchasedProducts(['mensch_sein', 'fds_mensch_sein']);
                } else {
                  offlineManager.savePurchasedProducts([data.id, 'schmetterling', 'fds_schmetterling', 'fds_hoerbuch_schmetterling']);
                }
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

  const isSeeleWind = Boolean(
    (productData?.id && (productData.id.includes('seele') || productData.id.includes('wind') || productData.id.includes('trauer'))) || 
    (productId && (productId.includes('seele') || productId.includes('wind') || productId.includes('trauer')))
  );
  const isMenschSein = !isSeeleWind && Boolean(
    (productData?.id && (productData.id.includes('mensch') || productData.id.includes('echt'))) || 
    (productId && (productId.includes('mensch') || productId.includes('echt')))
  );
  const coverImage = isSeeleWind 
    ? '/images/products/cover_seele_wind.jpg' 
    : (isMenschSein ? '/images/products/cover_mensch_sein.jpg?v=2' : '/images/products/cover_schmetterling.jpg');
  const chapters = isSeeleWind ? SEELE_WIND_CHAPTERS : (isMenschSein ? MENSCH_SEIN_CHAPTERS : SCHMETTERLING_CHAPTERS);
  const title = productData?.titel || (isSeeleWind 
    ? 'Wo die Seele den Wind berührt' 
    : (isMenschSein ? 'Mut zum Echtsein - Was steckt hinter einem echtem Menschen' : 'Der Tag, an dem der Schmetterling erwachte'));
  const fallbackAudioUrl = isSeeleWind
    ? 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Wo%20die%20Seele%20den%20Wind%20ber%C3%BChrt.mp3'
    : (isMenschSein
      ? 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Mut%20zum%20echtsein.....mp3'
      : 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Der%20Tag%20an%20dem%20der%20Schmetterling%20erwachte%20Final.mp3');
  const audioUrl = productData?.audio_path || productData?.audio_url || productData?.hoerprobe_url || fallbackAudioUrl;
  const priceDisplay = productData?.preis ? `${productData.preis} €` : '4,99 €';
  const durationDisplay = isSeeleWind ? '86:06 Minuten' : (isMenschSein ? '58:39 Minuten' : '58:43 Minuten');
  const durationSecondsTotal = isSeeleWind ? 5166 : (isMenschSein ? 3519 : 3523);
  const disclaimerDurationText = isSeeleWind ? '1:27' : (isMenschSein ? '1:08' : '1:19');
  const disclaimerThreshold = isSeeleWind ? 87 : (isMenschSein ? 69 : 79);
  const freeChapter1Text = isSeeleWind ? '8:20 Min.' : (isMenschSein ? '11:00 Min.' : '17:05 Min.');
  const bookSlug = isSeeleWind ? 'wo-die-seele-den-wind-beruehrt' : (isMenschSein ? 'mensch_sein' : 'schmetterling');
  const startOffset = isSeeleWind ? 384 : (isMenschSein ? 69 : 79);

  // Hörproben-Steuerung
  const togglePlaySnippet = () => {
    const audio = snippetAudioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlayingSnippet(false);
    } else {
      if (audio.currentTime < startOffset || audio.currentTime >= startOffset + SNIPPET_DURATION) {
        audio.currentTime = startOffset;
        setSnippetCurrentTime(startOffset);
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
      "name": "Lisa"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Flow der Stille",
      "url": "https://flow-der-stille.de"
    },
    "inLanguage": "de-DE",
    "duration": isSeeleWind ? "PT86M06S" : (isMenschSein ? "PT58M39S" : "PT58M43S"),
    "sku": isSeeleWind ? "wo_die_seele_den_wind_beruehrt" : (isMenschSein ? "fds_mensch_sein" : "fds_schmetterling"),
    "brand": {
      "@type": "Brand",
      "name": "Flow der Stille"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://flow-der-stille.de/hoerbuch/${bookSlug}`,
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

  const bookCanonicalUrl = `https://flow-der-stille.de/hoerbuch/${bookSlug}`;
  const bookSeoTitle = isSeeleWind
    ? 'Hörbuch: Wo die Seele den Wind berührt – Flow der Stille'
    : (isMenschSein 
      ? 'Hörbuch: Vom Überleben zum Mensch sein – Flow der Stille' 
      : 'Hörbuch: Wenn der Schmetterling dem Wind vertraut – Flow der Stille');
  const bookSeoDesc = isSeeleWind
    ? "Hörbuch 'Wo die Seele den Wind berührt' von Jacqueline, gesprochen von Lisa. Sanfte Trauerbegleitung für Herz und Seele – Teil 2 von 'Der Tag, an dem der Schmetterling erwachte'."
    : (isMenschSein
      ? "Hörbuch 'Vom Überleben zum Mensch sein' von Jacqueline, gesprochen von Lisa. Dein Wegweiser für Mut zum Echtsein, Selbstakzeptanz und emotionale Befreiung."
      : "Hörbuch 'Wenn der Schmetterling dem Wind vertraut' von Jacqueline, gesprochen von Lisa. Trost, Hoffnung und Loslassen bei Trauer und Neuanfang.");
  const bookKeywords = isSeeleWind
    ? "Hörbuch Wo die Seele den Wind berührt, Trauerbegleitung Hörbuch, Trost bei Verlust, Loslassen lernen, Lisa, Jacqueline, Der Tag an dem der Schmetterling erwachte Teil 2, Flow der Stille"
    : (isMenschSein
      ? "Hörbuch Vom Überleben zum Mensch sein, Mut zum Echtsein, Jacqueline, Lisa, Trauma heilen, Selbstliebe Hörbuch, Hörbuch Persönlichkeitsentwicklung, Flow der Stille"
      : "Hörbuch Wenn der Schmetterling dem Wind vertraut, Hörbuch Trauerbewältigung, Loslassen lernen, Hoffnung bei Verlust, Lisa, Jacqueline, Flow der Stille");

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans py-6 px-4 sm:py-10 selection:bg-[var(--accent)] selection:text-white">
      <SEO
        title={bookSeoTitle}
        description={bookSeoDesc}
        canonicalUrl={bookCanonicalUrl}
        keywords={bookKeywords}
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
              if (cur >= startOffset + SNIPPET_DURATION) {
                snippetAudioRef.current.pause();
                snippetAudioRef.current.currentTime = startOffset;
                setSnippetCurrentTime(startOffset);
                setIsPlayingSnippet(false);
              }
            }
          }}
          onEnded={() => {
            setIsPlayingSnippet(false);
            setSnippetCurrentTime(startOffset);
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

            {/* Preis-Tag oben links über dem Bild */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs font-bold tracking-wider rounded-xl uppercase shadow-lg bg-[var(--accent)] text-white flex items-center gap-1.5 border border-white/20">
                <Gift size={13} />
                <span>{priceDisplay}</span>
                <span className="text-[10px] font-normal opacity-90">• Einmalkauf</span>
              </span>
              {isSeeleWind && (
                <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-xl uppercase shadow-lg bg-amber-600 text-white flex items-center gap-1 border border-white/20">
                  <span>Teil 2</span>
                </span>
              )}
              {!isSeeleWind && !isMenschSein && (
                <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-xl uppercase shadow-lg bg-stone-700 text-white flex items-center gap-1 border border-white/20">
                  <span>Teil 1</span>
                </span>
              )}
            </div>

            {/* Info-Banner über unterem Bildrand */}
            <div className="absolute bottom-3 inset-x-3 z-10">
              <div className="px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-center shadow-lg">
                <span className="text-[11px] font-semibold block leading-tight">
                  Kapitel 1 sofort gratis (ohne Anmeldung)
                </span>
                <span className="text-[10px] text-amber-200 font-medium block mt-0.5">
                  Gesamtes Hörbuch nach Registrierung für {priceDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Details & Primary Play / Buy Button */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
                <BookOpen size={14} />
                <span>Hörbuch • {durationDisplay}</span>
              </span>

              {isOwned ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={13} />
                  <span>In deiner Bibliothek freigeschaltet</span>
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    <Lock size={12} />
                    <span>Einmalig {priceDisplay} • Kein Abo</span>
                  </span>
                  <Link
                    to={`/ruhe-shop#product-${productData?.id || productId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 border border-amber-500/35 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                    title="Ohne Registrierung per Magic Link kaufen"
                  >
                    <Key size={13} className="text-amber-800 dark:text-amber-400 shrink-0" />
                    <span>Express-Kauf mit Magic Link ({priceDisplay})</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--text-main)] leading-tight">
                {title}
              </h1>
              {isSeeleWind && (
                <p className="text-xs sm:text-sm font-semibold text-[var(--accent)]">
                  Teil 2 der Schmetterling-Reihe • Sanfte Trauerbegleitung für Herz und Seele
                </p>
              )}
              {!isSeeleWind && !isMenschSein && (
                <p className="text-xs sm:text-sm font-semibold text-[var(--accent)]">
                  Teil 1 der Schmetterling-Reihe • Die Reise der Seele &amp; das Loslassen von Ängsten
                </p>
              )}
            </div>

            <p className="text-xs text-[var(--text-muted)] font-medium">
              Text: <strong className="text-[var(--text-main)]">Jacqueline</strong> • Stimme: <strong className="text-[var(--text-main)]">Lisa</strong> • <Link to="/ueber-uns" className="text-[var(--accent)] hover:underline">Über uns & Vision →</Link>
            </p>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
              {productData?.beschreibung || (isSeeleWind 
                ? 'Sanfte Trauerbegleitung für Herz und Seele – Teil 2 von „Der Tag, an dem der Schmetterling erwachte“. In 9 einfühlsamen Kapiteln und einer sanften Abschluss-Meditation begleitet dich dieses Hörbuch durch alle Phasen des Abschieds – heilsam, berührend und tief tröstend.'
                : (isMenschSein
                  ? 'Eine berührende Reise zu wahrer Authentizität und Selbstannahme. Wie wir lernen, Masken abzulegen und unser echtes Ich liebevoll anzunehmen.'
                  : 'Eine Geschichte über den Wandel des Lebens, die Raum für Trost, Zuversicht und tiefen Frieden schenkt. Sie begleitet dich dabei, dem Thema Abschied mit mehr innerer Ruhe und Vertrauen zu begegnen.'))}
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
                /* Fall 1: Produkt GEKAUFT -> Voller Zugriff auf das Hörbuch + Schnellauswahl Kapitel 1 */
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
                        ? `${disclaimerDurationText} Min. Hinweis anhören, danach freies Kapitel-Hüpfen`
                        : savedProgressTime
                        ? `Ab Minute ${formatTime(savedProgressTime)} weiterhören • Position gespeichert`
                        : `${durationDisplay} • Alle Kapitel & freies Spulen aktiv`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!audioUrl) return;
                      setInitialChapterTime(0);
                      setIsPlayerOpen(true);
                    }}
                    className="sm:w-auto px-5 py-3.5 rounded-2xl font-semibold transition-all shadow-md active:scale-95 flex flex-col items-center justify-center text-center min-h-[64px] bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                      <Play size={15} className="fill-white" />
                      <span>Mit 1 Klick Kapitel 1 anhören</span>
                    </div>
                    <span className="text-[10px] opacity-90 font-normal mt-0.5">
                      Direkt ab Kapitel 1 abspielen
                    </span>
                  </button>

                  {audioUrl && (
                    <div className="sm:w-auto min-h-[64px] flex flex-col justify-center">
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
                      <span>Mit 1 Klick Kapitel 1 sofort anhören</span>
                    </div>
                    <span className="text-[11px] opacity-90 font-normal mt-0.5">
                      100 % gratis ohne Registrierung abspielen ({freeChapter1Text})
                    </span>
                  </button>

                  <Link
                    to={`/ruhe-shop#product-${productData?.id || productId}`}
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

          </div>
        </div>

        {/* 🚀 Conversion-Hebel für Werbebesucher: Kapitel 1 kostenlos ohne Registrierung hören, Vollversion freischalten */}
        {!user && !isOwned && (
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-xl space-y-4">
            {/* Option 1: Express-Kauf mit Magic Link */}
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-left space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0">
                    <Key size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-amber-950 dark:text-amber-200 block">
                      Option 1: Express-Kauf mit Magic Link ({priceDisplay})
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      100 % ohne Passwort &amp; ohne Benutzerkonto • Sofortiger Zugang
                    </span>
                  </div>
                </div>

                <Link
                  to={`/ruhe-shop#product-${productData?.id || productId}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 text-center"
                >
                  <Gift size={14} />
                  <span>Jetzt mit Magic Link kaufen ({priceDisplay}) →</span>
                </Link>
              </div>

              <div className="text-[11px] text-[var(--text-muted)] space-y-1.5 leading-relaxed">
                <p>
                  <strong className="text-[var(--text-main)]">So einfach funktioniert der Magic Link:</strong> Du bezahlst bequem und sicher (PayPal, Karte oder SEPA). Direkt nach Zahlungseingang wird das Hörbuch im Web-Player freigeschaltet und dein persönlicher Zugangs-Link kommt per E-Mail. Klicke einfach auf den Link und höre alle {chapters.length} Kapitel sofort auf Smartphone, Tablet oder PC weiter.
                </p>
                <div className="flex items-center justify-end pt-1">
                  <Link
                    to="/pakete#magic-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-900 dark:text-amber-300 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>Details &amp; FAQ zum Magic Link ansehen</span>
                    <ExternalLink size={11} className="shrink-0" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Option 2: 1-Klick Hörer-Konto (SSO / E-Mail) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-muted)] block px-1">
                Option 2: Kostenloses Hörer-Konto (0 €)
              </span>
              <QuickSocialUnlockBox
                produkt={productData || { id: productId, titel: title, preis: 4.99, kategorie: 'Hörbuch' }}
                isAudiobook={true}
                price={priceDisplay}
                title="Gefällt dir Kapitel 1? Gesamtes Hörbuch freischalten"
                subtitle={`Kapitel 1 kannst du dir oben komplett ohne Registrierung kostenlos anhören (${freeChapter1Text}). Wenn du danach das gesamte Hörbuch (${chapters.length} Kapitel) dauerhaft hören möchtest: Jetzt mit 1 Klick registrieren und für einmalig ${priceDisplay} (kein Abo) freischalten:`}
                returnPath={location.pathname}
                compact={false}
              />
            </div>
          </div>
        )}

        {/* Kauf-Banner für eingeloggte Nutzer, die das Hörbuch noch nicht besitzen */}
        {user && !isOwned && (
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="font-bold text-base text-[var(--text-main)] block">Vollversion aller Kapitel freischalten ({priceDisplay})</span>
                <span className="text-xs text-[var(--text-muted)] block">Einmaliger Kauf • Dauerhafter Zugriff im Web &amp; in der Android-App • 100 % werbe- &amp; abofrei</span>
              </div>
              <Link
                to={`/ruhe-shop#product-${productData?.id || productId}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Gift size={16} />
                <span>Jetzt für {priceDisplay} kaufen</span>
              </Link>
            </div>
            {/* Express-Kauf Hinweis für eingeloggte Nutzer */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Key size={14} className="text-amber-800 dark:text-amber-400 shrink-0" />
                <span>
                  <strong className="text-[var(--text-main)]">Express-Kauf mit Magic Link:</strong> Sofortige Freischaltung in deinem Mediathek-Konto + zusätzlicher Magic Link per E-Mail für jedes weitere Endgerät.
                </span>
              </div>
              <Link
                to={`/ruhe-shop#product-${productData?.id || productId}`}
                className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:underline shrink-0 whitespace-nowrap"
              >
                Zum Ruhe-Shop →
              </Link>
            </div>
          </div>
        )}

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
                  {formatTime(Math.max(0, snippetCurrentTime - startOffset))} / {formatTime(SNIPPET_DURATION)}
                </span>
              </div>
            </div>

            <Link
              to={`/ruhe-shop#product-${productData?.id || productId}`}
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
                Genieße die Hörprobe und deine Inhalte mit <strong className="text-[var(--text-main)]">Hintergrund-Wiedergabe bei gesperrtem Bildschirm</strong>, ohne Browser-Unterbrechungen und ideal für unterwegs.
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
              {chapters.length} Abschnitte • {durationDisplay}
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
                  Einmaliger rechtlicher Hinweis erforderlich (00:00 bis {disclaimerDurationText} Min.)
                </span>
                <span className="text-xs text-stone-800 dark:text-amber-200/95 font-medium block leading-relaxed">
                  Bitte lausche zu Beginn der Einleitung einmalig bis zum Ende ({disclaimerDurationText} Min.). Erst danach werden alle weiteren Kapitel zur Direktauswahl freigeschaltet.
                </span>
              </div>
            </div>
          )}

          {/* Saubere Liste der Kapitel */}
          <div className="space-y-3">
            {chapters.map((ch, idx) => {
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

        {/* 🦋 Reihen-Verknüpfung: Die Schmetterling-Reihe (Werk 1 <-> Werk 2) */}
        {!isMenschSein && (
          <div className="bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-alt)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-center gap-6">
            <img
              src={isSeeleWind ? '/images/products/cover_schmetterling.jpg' : '/images/products/cover_seele_wind.jpg'}
              alt={isSeeleWind ? 'Cover: Der Tag, an dem der Schmetterling erwachte' : 'Cover: Wo die Seele den Wind berührt'}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md shrink-0 border border-[var(--border)]"
            />
            <div className="space-y-1.5 flex-1 text-center sm:text-left">
              <span className="text-[11px] font-mono uppercase font-bold text-[var(--accent)] tracking-wider">
                {isSeeleWind ? 'Teil 1 dieser Reihe • Die Vorgeschichte' : 'Teil 2 dieser Reihe • Sanfte Trauerbegleitung'}
              </span>
              <h4 className="font-serif font-bold text-lg text-[var(--text-main)]">
                {isSeeleWind ? 'Der Tag, an dem der Schmetterling erwachte' : 'Wo die Seele den Wind berührt'}
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {isSeeleWind
                  ? 'Erfahre die bewegende Reise der Seele und das Loslassen irdischer Ängste. Zusammen mit diesem Werk bildet es eine heilsame Einheit.'
                  : 'Die berührende Fortsetzung für alle, die einen geliebten Menschen vermissen. Einfühlsame Begleitung durch alle Phasen der Trauer.'}
              </p>
            </div>
            <Link
              to={isSeeleWind ? '/hoerbuch/schmetterling' : '/hoerbuch/wo-die-seele-den-wind-beruehrt'}
              className="px-5 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>{isSeeleWind ? 'Zu Teil 1' : 'Zu Teil 2 entdecken'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

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
                Du musst dir zuerst die Einleitung und den rechtlichen Hinweis ({disclaimerDurationText} Min.) einmalig vollständig anhören. Danach werden alle Kapitel zur Direktauswahl freigeschaltet und du kannst frei in den Kapiteln hüpfen.
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
                Dieses Kapitel ist Teil des vollständigen Hörbuchs. Schalte das Werk einmalig für <strong>{priceDisplay}</strong> frei, um alle {chapters.length} Kapitel und die vollen {Math.floor((productData?.dauer || durationSecondsTotal) / 60)} Minuten dauerhaft anzuhören.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5 text-left">
              {!user && (
                <div className="mb-2">
                  <QuickSocialUnlockBox
                    produkt={productData || { id: productId, titel: title, preis: 4.99, kategorie: 'Hörbuch' }}
                    isAudiobook={true}
                    price={priceDisplay}
                    title="Konto mit 1 Klick erstellen"
                    subtitle={`Erstelle unverbindlich dein Hörer-Konto mit 1 Klick, um das gesamte Hörbuch für einmalig ${priceDisplay} (kein Abo) freizuschalten:`}
                    returnPath={location.pathname}
                    compact={true}
                  />
                </div>
              )}

              <Link
                to={`/ruhe-shop#product-${productData?.id || productId}`}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Gift size={15} />
                <span>Jetzt für {priceDisplay} freischalten</span>
              </Link>

              <Link
                to={`/ruhe-shop#product-${productData?.id || productId}`}
                className="w-full py-3 px-5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 border border-amber-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Key size={14} className="text-amber-800 dark:text-amber-400 shrink-0" />
                <span>Express-Kauf mit Magic Link ({priceDisplay})</span>
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
          author="Jacqueline"
          reader="Lisa"
          audioUrl={audioUrl}
          coverImage={coverImage}
          durationSeconds={productData?.dauer || durationSecondsTotal}
          chapters={chapters}
          initialStartTime={hasListenedDisclaimer ? initialChapterTime : 0}
        />
      )}
    </div>
  );
}
