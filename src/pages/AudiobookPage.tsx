import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Sparkles, BookOpen, Clock, ShieldCheck, 
  ListMusic, Bookmark, HardDrive, AlertCircle, Lock, Gift, 
  Headphones, CheckCircle2, X 
} from 'lucide-react';
import SEO from '../components/SEO';
import { AudiobookPlayerModal, AudiobookChapter } from '../components/AudiobookPlayerModal';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { offlineManager } from '../lib/offlineAudioService';
import { getOfflineProductById, PRODUKT_COLUMNS } from '../lib/offlineProductsService';
import { OfflineDownloadButton } from '../components/OfflineDownloadButton';
import { isKnownAdminEmail } from '../lib/adminSecurity';

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
    title: 'Die Fassade bröckelt | Was bedeutet es, echt zu sein?', 
    subtitle: 'Der Mut, Masken abzulegen und zu sich selbst zu stehen',
    startTime: 69, 
    formattedTime: '01:09',
    duration: '11:00 Min.'
  },
  { 
    id: 'ch2', 
    number: 'Kapitel 2',
    title: 'Der spirituelle Werkzeugkasten | Bewusstsein mit Humor', 
    subtitle: 'Leichtigkeit und Achtsamkeit im Alltag integrieren',
    startTime: 729, 
    formattedTime: '12:09',
    duration: '8:41 Min.'
  },
  { 
    id: 'ch3', 
    number: 'Kapitel 3',
    title: 'In die Tiefe tauchen | Schatten & alte Muster', 
    subtitle: 'Alte Glaubenssätze erkennen und liebevoll transformieren',
    startTime: 1250, 
    formattedTime: '20:50',
    duration: '8:46 Min.'
  },
  { 
    id: 'ch4', 
    number: 'Kapitel 4',
    title: 'Die innere Ausrichtung | Klarheit, Willenskraft & Wege', 
    subtitle: 'Den inneren Kompass neu justieren und fokussieren',
    startTime: 1776, 
    formattedTime: '29:36',
    duration: '8:39 Min.'
  },
  { 
    id: 'ch5', 
    number: 'Kapitel 5',
    title: 'Die große Ausrichtung | Sehnsucht & Freiheit', 
    subtitle: 'Den eigenen Herzensweg mutig und frei beschreiten',
    startTime: 2295, 
    formattedTime: '38:15',
    duration: '8:40 Min.'
  },
  { 
    id: 'ch6', 
    number: 'Kapitel 6',
    title: 'Die Heimkehr ins Herz | Kraft bündeln & Wirken', 
    subtitle: 'Ganz bei dir ankommen und aus dem Herzen leben',
    startTime: 2815, 
    formattedTime: '46:55',
    duration: '8:44 Min.'
  },
  { 
    id: 'outro', 
    number: 'Klangreise',
    title: 'Klassisches Musikstück | Vollständiger Ausklang', 
    subtitle: 'Hinterlegtes Musikstück zum Nachspüren und Entspannen',
    startTime: 3339, 
    formattedTime: '55:39',
    duration: '3:00 Min.'
  }
];

const RAUHNAECHTE_CHAPTERS: FormattedAudiobookChapter[] = [
  {
    "id": "hinweis",
    "number": "Hinweis",
    "title": "Rechtlicher Hinweis & Urhebervermerk",
    "subtitle": "Wichtige rechtliche Orientierung vor Beginn der Seelenreisen",
    "startTime": 0,
    "formattedTime": "00:00",
    "duration": "1:02 Min."
  },
  {
    "id": "vorwort",
    "number": "Vorwort",
    "title": "Persönliches Vorwort der Begleiterin",
    "subtitle": "Willkommen an der Schwelle zwischen den Jahren (Julzeit)",
    "startTime": 62,
    "formattedTime": "01:02",
    "duration": "2:44 Min."
  },
  {
    "id": "auftakt",
    "number": "Auftakt • Med. 1",
    "title": "Auftakt: Die Wintersonnenwende (21. Dezember)",
    "subtitle": "Meditation: Das Stillstehen des Schicksalsrades | Krafttier: Schnee-Eule",
    "startTime": 226,
    "formattedTime": "03:46",
    "duration": "16:38 Min."
  },
  {
    "id": "ch1",
    "number": "1. Nacht • Med. 2",
    "title": "1. Rauhnacht: Wurzeln von Yggdrasil (Januar)",
    "subtitle": "Meditation: Am Fuße des Weltenbaums | Krafttier: Der Bär (Björn)",
    "startTime": 1224,
    "formattedTime": "20:24",
    "duration": "17:18 Min."
  },
  {
    "id": "ch2",
    "number": "2. Nacht • Med. 3",
    "title": "2. Rauhnacht: Die Quelle von Mimir (Februar)",
    "subtitle": "Meditation: Das Wasser der Seherkraft | Krafttier: Lachs der Weisheit",
    "startTime": 2262,
    "formattedTime": "37:42",
    "duration": "14:14 Min."
  },
  {
    "id": "ch3",
    "number": "3. Nacht • Med. 4",
    "title": "3. Rauhnacht: Friggas Spinnrad (März)",
    "subtitle": "Meditation: Herzöffnung & Vergebung | Krafttier: Schwan am Urdbrunnen",
    "startTime": 3116,
    "formattedTime": "51:56",
    "duration": "11:20 Min."
  },
  {
    "id": "ch4",
    "number": "4. Nacht • Med. 5",
    "title": "4. Rauhnacht: Hel & Hüterin der Schatten (April)",
    "subtitle": "Meditation: Hels Tor der Wandlung | Krafttier: Schlange der Häutung",
    "startTime": 3796,
    "formattedTime": "01:03:16",
    "duration": "11:53 Min."
  },
  {
    "id": "ch5",
    "number": "5. Nacht • Med. 6",
    "title": "5. Rauhnacht: Freyjas Zauber (Mai)",
    "subtitle": "Meditation: Freyjas Falkengewand | Krafttier: Die nordische Waldkatze",
    "startTime": 4509,
    "formattedTime": "01:15:09",
    "duration": "12:44 Min."
  },
  {
    "id": "ch6",
    "number": "6. Nacht • Med. 7",
    "title": "6. Rauhnacht: Balders Sonnenkraft (Juni)",
    "subtitle": "Meditation: Balders reinigendes Sonnenfeuer | Krafttier: Ratatöskr",
    "startTime": 5273,
    "formattedTime": "01:27:53",
    "duration": "12:52 Min."
  },
  {
    "id": "ch7",
    "number": "7. Nacht • Med. 8",
    "title": "7. Rauhnacht: Heimdalls Schwelle (Juli)",
    "subtitle": "Meditation: Auf der Brücke Bifröst | Krafttier: Hahn Gullinkambi",
    "startTime": 6045,
    "formattedTime": "01:40:45",
    "duration": "12:43 Min."
  },
  {
    "id": "ch8",
    "number": "8. Nacht • Med. 9",
    "title": "8. Rauhnacht: Thors Hammer (August)",
    "subtitle": "Meditation: Thors Blitz & Mjölnir | Krafttier: Ziegenbock Tanngrisnir",
    "startTime": 6808,
    "formattedTime": "01:53:28",
    "duration": "12:42 Min."
  },
  {
    "id": "ch9",
    "number": "9. Nacht • Med. 10",
    "title": "9. Rauhnacht: Skuld & das Runenweben (September)",
    "subtitle": "Meditation: Skulds Runen der Zukunft | Krafttier: Falke Vedrfölnir",
    "startTime": 7570,
    "formattedTime": "02:06:10",
    "duration": "11:25 Min."
  },
  {
    "id": "ch10",
    "number": "10. Nacht • Med. 11",
    "title": "10. Rauhnacht: Odins Speer des Fokus (Oktober)",
    "subtitle": "Meditation: Odins Speer des Fokus | Krafttier: Raben Hugin & Munin",
    "startTime": 8255,
    "formattedTime": "02:17:35",
    "duration": "11:04 Min."
  },
  {
    "id": "ch11",
    "number": "11. Nacht • Med. 12",
    "title": "11. Rauhnacht: Das Ahnengedenken (November)",
    "subtitle": "Meditation: Der Kreis der Ahnen | Krafttier: Wölfe Geri & Freki",
    "startTime": 8919,
    "formattedTime": "02:28:39",
    "duration": "12:34 Min."
  },
  {
    "id": "ch12",
    "number": "12. Nacht • Med. 13",
    "title": "12. Rauhnacht: Frau Holle schließt das Tor (Dezember)",
    "subtitle": "Meditation: Frau Holle schüttelt den Segen | Krafttier: Weißer Hirsch",
    "startTime": 9673,
    "formattedTime": "02:41:13",
    "duration": "13:33 Min."
  },
  {
    "id": "outro_rauhnaechte",
    "number": "Abschluss",
    "title": "Rückkehr ins neue Jahr",
    "subtitle": "Vollendung des heiligen Kreises & Dank",
    "startTime": 10486,
    "formattedTime": "02:54:46",
    "duration": "4:14 Min."
  }
];

export default function AudiobookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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
  // Hörproben kommen nur noch aus der öffentlichen hoerprobe_url (eigener Schnitt, Start bei 0)
  const SNIPPET_START_TIME = 0;
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
                             offlineManager.isPurchasedOffline('fds_schmetterling') ||
                             (isKnownAdminEmail(user?.email));
      if (isOfflineOwned) {
        setIsOwned(true);
        if (shouldAutoPlay) {
          setIsPlayerOpen(true);
        }
      }

      try {
        const supabase = getSupabase();
        const isDefaultSchmetterling = !productId || productId === 'fds_hoerbuch_schmetterling' || productId === 'schmetterling' || productId === 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte';
        let query = supabase.from('produkte').select(PRODUKT_COLUMNS);
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

              const isAdmin = isKnownAdminEmail(user.email);
              const hasPurchased = !!purchaseData || isOfflineOwned || isAdmin;
              setIsOwned(hasPurchased);
              if (hasPurchased) {
                offlineManager.savePurchasedProducts([data.id, 'schmetterling', 'fds_schmetterling', 'rauhnaechte', 'fds_rauhnaechte']);
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
  const isRauhnaechte = Boolean(
    (productData?.id && (productData.id.includes('rauhn') || productData.id.includes('raun') || productData.id.includes('yggdrasil'))) ||
    (productId && (productId.includes('rauhn') || productId.includes('raun') || productId.includes('yggdrasil'))) ||
    (productData?.titel && productData.titel.toLowerCase().includes('rauhn'))
  );


  const coverImage = isRauhnaechte 
    ? '/images/products/cover_rauhnaechte.jpg' 
    : isMenschSein 
      ? '/images/products/cover_mensch_sein.jpg?v=2' 
      : '/images/products/cover_schmetterling.jpg';
  const chapters = isRauhnaechte 
    ? RAUHNAECHTE_CHAPTERS 
    : isMenschSein 
      ? MENSCH_SEIN_CHAPTERS 
      : SCHMETTERLING_CHAPTERS;
  const title = productData?.titel || (isRauhnaechte 
    ? 'Yggdrasils Atem | 12 Rauhnächte auf der Schwelle' 
    : isMenschSein 
      ? 'Mut zum Echtsein | Was steckt hinter einem echten Menschen' 
      : 'Der Tag, an dem der Schmetterling erwachte');
  // Öffentliche Hörprobe (frei abspielbar). Die Vollversion läuft nur über das geschützte Streaming.
  const snippetUrl: string = (typeof productData?.hoerprobe_url === 'string' && productData.hoerprobe_url.trim()) || '';
  const streamProdukt = { id: productData?.id || productId || 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte', titel: productData?.titel, preis: productData?.preis };
  const priceDisplay = productData?.preis ? `${Number(productData.preis).toFixed(2).replace('.', ',')} €` : (isRauhnaechte ? '9,99 €' : '4,99 €');

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
    "description": productData?.beschreibung || (isRauhnaechte ? "Schamanische Seelenreisen durch die Julzeit und die Rauhnächte von Jacqueline Schmetzer." : "Ganzheitliches Hörbuch über innere Verwandlung, Achtsamkeit und Bewusstsein von Jacqueline Schmetzer."),
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
    "duration": isRauhnaechte ? "PT2H58M59S" : (isMenschSein ? "PT58M39S" : "PT58M43S"),
    "sku": isRauhnaechte ? "fds_rauhnaechte" : (isMenschSein ? "fds_mensch_sein" : "fds_schmetterling"),
    "brand": {
      "@type": "Brand",
      "name": "Flow der Stille"
    },
    "offers": {
      "@type": "Offer",
      "url": isRauhnaechte 
        ? "https://flow-der-stille.de/hoerbuch/rauhnaechte" 
        : (isMenschSein ? "https://flow-der-stille.de/hoerbuch/mensch_sein" : "https://flow-der-stille.de/hoerbuch/schmetterling"),
      "priceCurrency": "EUR",
      "price": isRauhnaechte ? "9.99" : "4.99",
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
        title={`${title} | Flow der Stille`}
        description={isRauhnaechte ? "Schamanische Seelenreisen durch die Julzeit und die Rauhnächte von Jacqueline Schmetzer." : "Ganzheitliches Hörbuch über innere Verwandlung und Achtsamkeit von Jacqueline Schmetzer."}
        image={coverImage}
        schemaJson={audiobookSchema}
      />

      {/* Audio-Element für die 90s Hörprobe ab 1:19 Min. */}
      {snippetUrl && (
        <audio
          ref={snippetAudioRef}
          src={snippetUrl}
          preload="none"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
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
                <span>Hörbuch • {isRauhnaechte ? '2 Std. 59 Min.' : (isMenschSein ? '58:39 Minuten' : '58:43 Minuten')}</span>
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
                      setInitialChapterTime(hasListenedDisclaimer && savedProgressTime ? savedProgressTime : 0);
                      setIsPlayerOpen(true);
                    }}
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
                        ? `${isRauhnaechte ? '1:02' : (isMenschSein ? '1:08' : '1:19')} Min. Hinweis anhören, danach freies Kapitel-Hüpfen`
                        : savedProgressTime
                        ? `Ab Minute ${formatTime(savedProgressTime)} weiterhören • Position gespeichert`
                        : `${isRauhnaechte ? '2 Std. 59 Min.' : (isMenschSein ? '58:39 Min.' : '58:43 Min.')} • Alle Kapitel & freies Spulen aktiv`}
                    </span>
                  </button>

                  <div className="flex-1 min-h-[64px] flex flex-col justify-center">
                    <OfflineDownloadButton
                      productId={streamProdukt.id}
                      title={title}
                      variant="button"
                    />
                  </div>
                </>
              ) : (
                /* Fall 2: Produkt NOCH NICHT GEKAUFT -> Kauf-Button & 90s Hörprobe */
                <>
                  <Link
                      to={`/premium#product-${productData?.id || productId}`}
                      className="flex-1 py-3.5 px-6 rounded-2xl font-semibold transition-all shadow-md active:scale-95 flex flex-col items-center justify-center text-center min-h-[64px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Gift size={16} />
                        <span>Hörbuch für {priceDisplay} freischalten</span>
                      </div>
                      <span className="text-[11px] opacity-90 font-normal mt-0.5">
                        Einmaliger Kauf • Kein Abo • Volle {isRauhnaechte ? '2 Std. 59 Min.' : (isMenschSein ? '58:39 Min.' : '58:43 Min.')}
                      </span>
                    </Link>

                  {snippetUrl && (
                  <button
                    type="button"
                    onClick={togglePlaySnippet}
                    className="sm:w-auto px-5 py-3.5 rounded-2xl font-semibold transition-all border border-[var(--border)] bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] flex flex-col items-center justify-center text-center min-h-[64px] cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      {isPlayingSnippet ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                      <span>{isPlayingSnippet ? 'Hörprobe stoppen' : '90 Sek. Hörprobe'}</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">
                      Kapitel 1 (Auszug)
                    </span>
                  </button>
                  )}
                </>
              )}
            </div>
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

        {isRauhnaechte && (
          <div className="p-4 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--text-main)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-4">
            <div className="flex items-center gap-2.5 text-left">
              <Sparkles size={16} className="text-[var(--accent)] shrink-0" />
              <span>
                <strong>Hintergrund, Rituale & News:</strong> Alle 13 Stationen, Krafttiere und Räucheranleitungen findest du auf unserer Themenseite.
              </span>
            </div>
            <Link
              to="/rauhnaechte-vorschau"
              className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white font-semibold whitespace-nowrap hover:bg-[var(--accent-hover)] transition-colors shrink-0"
            >
              Zur Themenseite & News →
            </Link>
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
              {chapters.length} Abschnitte • {isRauhnaechte ? '2 Std. 59 Min.' : (isMenschSein ? '58:39 Min.' : '58:43 Min.')}
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
                  Einmaliger rechtlicher Hinweis erforderlich (00:00 bis {isRauhnaechte ? '01:02' : (isMenschSein ? '01:08' : '01:19')} Min.)
                </span>
                <span className="text-xs text-stone-800 dark:text-amber-200/95 font-medium block leading-relaxed">
                  Bitte lausche zu Beginn der Einleitung einmalig bis zum Ende ({isRauhnaechte ? '1:02' : (isMenschSein ? '1:08' : '1:19')} Min.). Erst danach werden alle weiteren Kapitel zur Direktauswahl freigeschaltet.
                </span>
              </div>
            </div>
          )}

          {/* Saubere Liste der Kapitel */}
          <div className="space-y-3">
            {chapters.map((ch) => {
              const disclaimerThreshold = isRauhnaechte ? 62 : (isMenschSein ? 69 : 79);
              const isLockedByDisclaimer = isOwned && !hasListenedDisclaimer && ch.id !== 'intro' && ch.startTime >= disclaimerThreshold;
              const isAvailable = isOwned && (hasListenedDisclaimer || ch.id === 'intro');

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    if (!isOwned) {
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
                      : isLockedByDisclaimer
                      ? 'bg-[var(--bg-alt)]/60 border-[var(--border)] opacity-85 hover:border-amber-400/60'
                      : 'bg-[var(--bg-alt)]/60 border-[var(--border)] hover:border-amber-400/50'
                  }`}
                >
                  {/* Titel und Untertitel sauber untereinander */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--accent)]/20">
                        {ch.number}
                      </span>
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
                Du musst dir zuerst die Einleitung und den rechtlichen Hinweis ({isRauhnaechte ? '1:02 Min.' : (isMenschSein ? '1:08 Min.' : '1:19 Min.')}) einmalig vollständig anhören. Danach werden alle Kapitel zur Direktauswahl freigeschaltet und du kannst frei in den Kapiteln hüpfen.
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

              {snippetUrl && (
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
              )}

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

      {/* Vollwertiger Audiobook Player Modal (NUR wenn freigeschaltet) */}
      {isOwned && (
        <AudiobookPlayerModal
          isOpen={isPlayerOpen}
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
          streamProdukt={streamProdukt}
          coverImage={coverImage}
          durationSeconds={productData?.dauer || (isRauhnaechte ? 10740 : (isMenschSein ? 3519 : 3523))}
          chapters={chapters}
          initialStartTime={hasListenedDisclaimer ? initialChapterTime : 0}
        />
      )}
    </div>
  );
}
