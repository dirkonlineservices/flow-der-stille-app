import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Sparkles, BookOpen, Clock, ShieldCheck, 
  ListMusic, Bookmark, HardDrive, AlertCircle, Lock, Gift, 
  Headphones, CheckCircle2, X 
} from 'lucide-react';
import SEO from '../components/SEO';
import { AudiobookPlayerModal, AudiobookChapter } from '../components/AudiobookPlayerModal';
import { OfflineDownloadButton } from '../components/OfflineDownloadButton';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { offlineManager } from '../lib/offlineAudioService';
import { getOfflineProductById } from '../lib/offlineProductsService';

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
        const res: any = await Promise.race([
          supabase
            .from('produkte')
            .select('*')
            .or(`id.eq.${productId},titel.ilike.%schmetterling%,titel.ilike.%hörbuch%`)
            .limit(1)
            .maybeSingle(),
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

  const title = productData?.titel || 'Der Tag, an dem der Schmetterling erwachte';
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

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans py-6 px-4 sm:py-10 selection:bg-[var(--accent)] selection:text-white">
      <SEO
        title={`${title} – Flow der Stille`}
        description="Ganzheitliches Hörbuch über innere Verwandlung und Achtsamkeit von Jacqueline Schmetzer."
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
              src="/images/products/cover_schmetterling.jpg"
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
                <span>Hörbuch • 58:43 Minuten</span>
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
                      setInitialChapterTime(0);
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
                          : 'Vollständiges Hörbuch abspielen'}
                      </span>
                    </div>
                    <span className="text-[11px] opacity-90 font-normal mt-0.5">
                      {!hasListenedDisclaimer
                        ? '1:19 Min. Hinweis anhören, danach freies Kapitel-Hüpfen'
                        : '58:43 Min. • Alle Kapitel & freies Spulen aktiv'}
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
                      Einmaliger Kauf • Kein Abo • Volle 58:43 Min.
                    </span>
                  </Link>

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
              5 Abschnitte • 58:43 Min.
            </span>
          </div>

          {/* Hinweis wenn Disclaimer noch nicht angehört wurde */}
          {isOwned && !hasListenedDisclaimer && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs">
              <Lock size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Einmaliger rechtlicher Hinweis erforderlich (00:00 bis 01:19 Min.)</span>
                <span className="text-[11px] opacity-90 block">
                  Bitte lausche zu Beginn der Einleitung einmalig bis zum Ende (1:19 Min.). Erst danach werden alle weiteren Kapitel zur Direktauswahl freigeschaltet.
                </span>
              </div>
            </div>
          )}

          {/* Saubere Liste der Kapitel */}
          <div className="space-y-3">
            {SCHMETTERLING_CHAPTERS.map((ch) => {
              const isLockedByDisclaimer = isOwned && !hasListenedDisclaimer && ch.id !== 'intro' && ch.startTime >= 79;
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
                        : isLockedByDisclaimer
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-600'
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
                Du musst dir zuerst die Einleitung und den rechtlichen Hinweis (1:19 Min.) einmalig vollständig anhören. Danach werden alle Kapitel zur Direktauswahl freigeschaltet und du kannst frei in den Kapiteln hüpfen.
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
                Dieses Kapitel ist Teil des vollständigen Hörbuchs. Schalte das Werk einmalig für <strong>{priceDisplay}</strong> frei, um alle 4 Kapitel und die vollen 58 Minuten dauerhaft anzuhören.
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

      {/* Vollwertiger Audiobook Player Modal (NUR wenn freigeschaltet) */}
      {isOwned && (
        <AudiobookPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => {
            setIsPlayerOpen(false);
            try {
              setHasListenedDisclaimer(localStorage.getItem(DISCLAIMER_KEY) === 'true');
            } catch {}
          }}
          productId={productData?.id || productId}
          title={title}
          author="Jacqueline Schmetzer"
          reader="Lisa Ragusa"
          audioUrl={audioUrl}
          coverImage="/images/products/cover_schmetterling.jpg"
          durationSeconds={3523}
          chapters={SCHMETTERLING_CHAPTERS}
          initialStartTime={hasListenedDisclaimer ? initialChapterTime : 0}
        />
      )}
    </div>
  );
}
