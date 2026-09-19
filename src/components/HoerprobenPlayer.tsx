/**
 * HoerprobenPlayer – Kostenlose Klangprobe für alle Produkte.
 *
 * Nutzt hoerprobe_url (falls vorhanden) oder greift direkt auf audio_path zu.
 * Überspringt bei Voll-Audios automatisch die ersten 70 Sek. (1:10 Min.),
 * sodass der gesprochene Haftungsausschluss/Disclaimer übersprungen wird
 * und direkt die beruhigende Klangprobe ertönt.
 *
 * Spezialfall Ernährung: Startet bei Sekunde 86, um die 16-Sekunden-Sprechpause
 * zu überspringen und direkt mit "Spüre, wie sich die Muskeln..." zu beginnen.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Headphones, Loader2, Sparkles, Gift, Lock, BookOpen, ArrowUp, X } from 'lucide-react';
import { getPlayableAudioUrl } from '../lib/offlineAudioService';
import { OfflineDownloadButton } from './OfflineDownloadButton';
import { useAuth } from '../context/AuthContext';
import FullAudioRegistrationModal from './FullAudioRegistrationModal';

interface Props {
  /** Das komplette Produkt-Objekt aus Supabase */
  produkt: any;
  /** Variante für Darstellung: 'compact' (platzsparend für Mobile/Listen) oder 'full' */
  variant?: 'compact' | 'full';
  /** Optionaler Button "Zum Produkt" mit Anchor-Scroll */
  showProductLink?: boolean;
  /** Callback beim Klick auf "Zum Produkt" */
  onProductClick?: (productId: string) => void;
  /** Sofort nach dem Laden automatisch abspielen (z. B. bei ?autoplay=true) */
  autoPlay?: boolean;
  /** Schwebenden Mini-Player beim Weiterscrollen einblenden */
  enableFloatingPlayer?: boolean;
}

export function HoerprobenPlayer({ 
  produkt, 
  variant = 'compact', 
  showProductLink = false, 
  onProductClick,
  autoPlay = false,
  enableFloatingPlayer = true
}: Props) {
  // Bevorzugt eine speziell geschnittene hoerprobe_url, sonst greift er auf das Hauptaudio audio_path zu
  const rawUrl: string = (produkt?.hoerprobe_url && typeof produkt.hoerprobe_url === 'string' && produkt.hoerprobe_url.trim() !== '')
    ? produkt.hoerprobe_url.trim()
    : (produkt?.audio_path && typeof produkt.audio_path === 'string' && produkt.audio_path.trim() !== '')
    ? produkt.audio_path.trim()
    : '';

  // Startzeit bestimmen:
  // - Wenn eigens geschnittene hoerprobe_url vorhanden: 0
  // - Spezialfall Schmetterling: 79 Sek. (Kapitel 1 Beginn)
  // - Spezialfall Selbsthypnose Ernährung: 86 Sek. (überspringt Disclaimer + 16s Sprechpause -> startet direkt bei "Spüre, wie sich die Muskeln...")
  // - Wenn kurzes Audio (< 90 Sek., z. B. Atemübung): 0
  // - Standard für alle Hauptaudios: 70 Sek. (1:10 Min.), um den gesprochenen Disclaimer zu überspringen!
  const getStartTime = () => {
    if (produkt?.hoerprobe_url && typeof produkt.hoerprobe_url === 'string' && produkt.hoerprobe_url.trim() !== '') {
      return 0;
    }
    if (produkt?.id === 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte') {
      return 79;
    }
    if (produkt?.id?.includes('ernaehrung')) {
      return 86; // 70s + 16s Pause abgeschnitten -> startet sofort mit beruhigender Stimme
    }
    const dur = Number(produkt?.dauer) || 0;
    if (dur > 0 && dur < 90) {
      return 0;
    }
    return 70; // 1:10 Min.
  };

  const startTime = getStartTime();
  const { user } = useAuth();
  const [showRegModal, setShowRegModal] = useState(false);
  const [snippetEnded, setSnippetEnded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string>(rawUrl);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(Number(produkt?.dauer) || 0);

  // Floating Player Status beim Scrollen
  const [isScrolledPast, setIsScrolledPast] = useState(false);
  const [dismissFloating, setDismissFloating] = useState(false);

  // Scroll Listener zur Erkennung, ob der Hauptplayer aus dem Sichtfeld gescrollt ist
  useEffect(() => {
    if (!enableFloatingPlayer) return;
    const handleScroll = () => {
      if (!playerContainerRef.current) return;
      const rect = playerContainerRef.current.getBoundingClientRect();
      setIsScrolledPast(rect.bottom < 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableFloatingPlayer]);

  // Ist es ein kostenloses Produkt? (preis ist 0, '0', '0.00' oder nicht gesetzt)
  const isFreeProduct = !produkt?.preis || Number(produkt.preis) === 0;

  // Gesamtlänge und Netto-Länge nach Disclaimer
  const totalDuration = duration || Number(produkt?.dauer) || 600;
  const netDuration = Math.max(15, totalDuration - startTime);

  // Ist es ein Hörbuch mit Kapiteln?
  const isAudiobook = Boolean(
    produkt?.id?.includes('hoerbuch') || 
    produkt?.id?.includes('mensch_sein') || 
    produkt?.id?.includes('schmetterling') ||
    produkt?.kategorie === 'hoerbuch'
  );

  // 🎯 Snippet-Dauer:
  // 1. Hörbücher: Erstes Kapitel komplett
  // 2. Kostenfreie Produkte: Eingeloggt 100%, Gäste 60s
  // 3. Kostenpflichtige Produkte: 25 % der Netto-Dauer
  const audiobookChapter1Duration = (produkt?.id?.includes('mensch_sein') || produkt?.id?.includes('echtsein'))
    ? Math.max(120, 729 - startTime)
    : Math.max(120, 1147 - startTime);

  const actualSnippetDuration = isAudiobook
    ? audiobookChapter1Duration
    : isFreeProduct && user
    ? netDuration
    : isFreeProduct && !user
    ? Math.min(60, netDuration)
    : Math.max(90, Math.round(netDuration * 0.25));

  useEffect(() => {
    let isMounted = true;
    async function resolveAudio() {
      if (!rawUrl) return;
      try {
        const playable = await getPlayableAudioUrl(`hoerprobe_${produkt.id}`, rawUrl, `Klangprobe: ${produkt.titel}`);
        if (isMounted && playable) setAudioUrl(playable);
      } catch (e) {
        console.warn('Could not resolve offline audio for hoerprobe:', e);
      }
    }
    resolveAudio();
    return () => { isMounted = false; };
  }, [rawUrl, produkt.id, produkt.titel]);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setHasStarted(true);
    setDismissFloating(false);

    // Alle anderen Audio-Elemente pausieren
    document.querySelectorAll('audio').forEach((el) => {
      if (el !== audio) el.pause();
    });

    const srcToPlay = audioUrl || rawUrl;
    const needsSrcSet = !audio.src || audio.src === '' || audio.src === window.location.href;
    if (needsSrcSet) {
      audio.src = srcToPlay;
      audio.load();
    }

    if (audio.currentTime < startTime || audio.currentTime >= startTime + actualSnippetDuration) {
      audio.currentTime = startTime;
      setCurrentTime(startTime);
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Audio play error:', err);
          if (rawUrl && audio.src !== rawUrl) {
            audio.src = rawUrl;
            audio.load();
            audio.currentTime = startTime;
            audio.play().then(() => setIsPlaying(true)).catch((e) => console.error('Fallback play failed:', e));
          }
        });
    }

    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'hoerprobe_play',
        audio_title: produkt.titel,
        audio_category: produkt.kategorie,
        has_skipped_disclaimer: startTime > 0,
      });
    }
  };

  // Autoplay Trigger, wenn die Seite mit ?autoplay=true aufgerufen wurde
  useEffect(() => {
    if (autoPlay && rawUrl && audioRef.current && !isPlaying) {
      const timer = setTimeout(() => {
        togglePlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, rawUrl]);

  // Nichts rendern, wenn weder Hörprobe noch Audio-Pfad vorhanden ist
  if (!rawUrl) return null;

  const progress = Math.min(
    100, 
    Math.max(0, ((currentTime - startTime) / actualSnippetDuration) * 100)
  );

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = startTime + (ratio * actualSnippetDuration);
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const scrollToProduct = () => {
    if (onProductClick) {
      onProductClick(produkt.id);
    } else {
      const el = document.getElementById(`product-${produkt.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.location.hash = `product-${produkt.id}`;
      }
    }
  };

  return (
    <>
      <div 
        ref={playerContainerRef}
        className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs transition-all ${variant === 'compact' ? 'p-3.5 sm:p-4' : 'p-5'}`}
      >
        {/* Header-Zeile mit Titel, Disclaimer-Skip-Badge, Offline-Icon und optionalem "Zum Produkt"-Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Headphones size={14} />
            </span>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-main)] leading-snug">
                {isFreeProduct && user ? 'Kostenfreie Vollversion:' : 'Kostenlose Hörprobe:'}
              </span>
              <span className="font-serif italic font-normal text-xs sm:text-sm text-[var(--text-muted)] truncate max-w-[180px] sm:max-w-none">
                {produkt.titel}
              </span>
              {isAudiobook ? (
                <span 
                  title="Bei Hörbüchern hörst du das gesamte 1. Kapitel kostenlos."
                  className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 whitespace-nowrap cursor-help"
                >
                  Kapitel 1 kostenlos ({formatTime(actualSnippetDuration)} Min.)
                </span>
              ) : isFreeProduct && user ? (
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 whitespace-nowrap">
                  100% Freigeschaltet
                </span>
              ) : isFreeProduct && !user ? (
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-semibold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 whitespace-nowrap">
                  Kostenlos (Vorschau)
                </span>
              ) : (
                <span 
                  title="Du hörst 25 % dieser Meditation kostenlos."
                  className="text-[10px] font-mono text-[var(--accent)] font-semibold bg-[var(--accent)]/10 px-2 py-0.5 rounded-full border border-[var(--accent)]/25 whitespace-nowrap cursor-help"
                >
                  25 % Hörprobe ({formatTime(actualSnippetDuration)} Min.)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <OfflineDownloadButton
              productId={`hoerprobe_${produkt.id}`}
              audioUrl={rawUrl}
              title={`Klangprobe: ${produkt.titel}`}
              variant="icon"
            />

            {showProductLink && (
              <button
                onClick={scrollToProduct}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                Zum Produkt →
              </button>
            )}
          </div>
        </div>

        {/* Audio-Steuerung: Play Button + Vollbreiten-Fortschrittsbalken */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => {
              setSnippetEnded(false);
              togglePlay();
            }}
            disabled={isLoading}
            aria-label={isLoading ? 'Wird geladen…' : isPlaying ? 'Pause' : 'Klangprobe abspielen'}
            className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 shadow-sm active:scale-95 transition-all text-white ${
              isLoading
                ? 'bg-[var(--accent)]/60 cursor-not-allowed'
                : isPlaying
                ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] ring-2 ring-[var(--accent)]/30 cursor-pointer'
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} fill="white" stroke="none" />
            ) : (
              <Play size={16} className="ml-0.5" fill="white" stroke="none" />
            )}
          </button>

          {/* Fortschrittsbalken + Zeit */}
          <div className="flex-1 w-full min-w-0">
            <div
              className="relative h-2.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-full cursor-pointer overflow-hidden mb-1.5"
              onClick={handleSeek}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-[var(--accent)]/30 animate-pulse rounded-full" />
              )}
              <div
                className="absolute left-0 top-0 h-full bg-[var(--accent)] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono font-medium">
              <span>{isLoading ? 'Lädt…' : formatTime(Math.max(0, currentTime - startTime))}</span>
              <span>{formatTime(actualSnippetDuration)}</span>
            </div>
          </div>
        </div>

        {/* 🎯 Call-to-Action nach Ablauf der 25% Hörprobe bzw. Schnupperprobe */}
        {snippetEnded && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fadeIn">
            <div className="text-xs text-[var(--text-muted)] text-center sm:text-left">
              {isAudiobook ? (
                <span>Kapitel 1 beendet. Möchtest du alle weiteren Kapitel des Hörbuchs hören?</span>
              ) : isFreeProduct && !user ? (
                <span>Hat dir die Vorschau gefallen? Schalte die volle Session jetzt kostenlos frei.</span>
              ) : !isFreeProduct ? (
                <span>25 % Hörprobe beendet. Möchtest du die gesamte Meditation hören?</span>
              ) : null}
            </div>

            {isFreeProduct && !user ? (
              <button
                type="button"
                onClick={() => setShowRegModal(true)}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Mit 1 Klick gratis freischalten</span>
              </button>
            ) : isAudiobook ? (
              <Link
                to={produkt.id?.includes('mensch_sein') || produkt.id?.includes('echtsein') ? '/hoerbuch/mensch_sein' : '/hoerbuch/schmetterling'}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Gesamtes Hörbuch freischalten ({produkt.preis ? `${produkt.preis} €` : '4,99 €'}) →</span>
              </Link>
            ) : !isFreeProduct ? (
              <button
                type="button"
                onClick={scrollToProduct}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Gift size={13} />
                <span>Vollversion freischalten ({produkt.preis ? `${produkt.preis} €` : '1,99 €'}) →</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Audio-Element mit preload="none" */}
        <audio
          ref={audioRef}
          controlsList="nodownload"
          preload="none"
          className="hidden"
          onTimeUpdate={() => {
            if (audioRef.current) {
              const cur = audioRef.current.currentTime;
              setCurrentTime(cur);
              // Nach Ablauf des 25%-Ausschnitts (bzw. bei Gästen 60s) automatisch stoppen
              if (cur >= startTime + actualSnippetDuration) {
                audioRef.current.pause();
                audioRef.current.currentTime = startTime;
                setCurrentTime(startTime);
                setIsPlaying(false);
                setSnippetEnded(true);

                if (isFreeProduct && !user) {
                  setShowRegModal(true);
                }
              }
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              const d = audioRef.current.duration;
              if (d && isFinite(d)) setDuration(d);
              if (audioRef.current.currentTime < startTime) {
                audioRef.current.currentTime = startTime;
                setCurrentTime(startTime);
              }
            }
          }}
          onPlay={() => { setIsPlaying(true); setIsLoading(false); setSnippetEnded(false); }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onEnded={() => {
            setIsPlaying(false);
            setIsLoading(false);
            setSnippetEnded(true);
            if (audioRef.current) audioRef.current.currentTime = startTime;
            setCurrentTime(startTime);
            if ((window as any).dataLayer) {
              (window as any).dataLayer.push({
                event: 'hoerprobe_complete',
                audio_title: produkt.titel,
              });
            }
          }}
        />
      </div>

      {/* 🪟 Schwebender Mini-Player auf der rechten Seite beim Weiterscrollen */}
      {enableFloatingPlayer && isScrolledPast && (isPlaying || hasStarted || snippetEnded) && !dismissFloating && (
        <aside 
          aria-label="Laufende Audiowiedergabe"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-2xl p-3 sm:p-3.5 flex items-center gap-3 animate-fadeIn transition-all text-[var(--text-main)]"
        >
          {/* Pulsierendes Mini-Icon / Cover */}
          <button
            onClick={() => {
              playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            title="Zurück zum Hauptplayer scrollen"
            className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 shrink-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <span className="flex items-center gap-0.5 h-4">
                <span className="w-1 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                <span className="w-1 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                <span className="w-1 bg-[var(--accent)] rounded-full animate-bounce h-2" />
              </span>
            ) : (
              <Headphones size={18} />
            )}
          </button>

          {/* Titel & Fortschrittsbalken */}
          <div 
            onClick={() => {
              playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="flex-1 min-w-0 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between gap-1 text-xs">
              <span className="font-semibold text-[var(--text-main)] truncate max-w-[170px] sm:max-w-[220px]">
                {produkt.titel}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                {formatTime(Math.max(0, currentTime - startTime))} / {formatTime(actualSnippetDuration)}
              </span>
            </div>
            {/* Fortschritts-Spur */}
            <div className="w-full h-1 bg-[var(--bg-alt)] border border-[var(--border)] rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steuerung oder 1-Klick Freischalten */}
          {snippetEnded ? (
            <button
              onClick={() => {
                setShowRegModal(true);
                playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="py-1.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Sparkles size={12} />
              <span>1-Klick Freischalten</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Abspielen'}
                className="w-8 h-8 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause size={13} fill="white" stroke="none" /> : <Play size={13} className="ml-0.5" fill="white" stroke="none" />}
              </button>

              <button
                onClick={() => {
                  playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                title="Nach oben zum Player scrollen"
                aria-label="Zum Player scrollen"
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] rounded-lg transition-colors cursor-pointer"
              >
                <ArrowUp size={15} />
              </button>
            </div>
          )}

          {/* Schließen Button */}
          <button
            onClick={() => setDismissFloating(true)}
            title="Schwebenden Player minimieren"
            aria-label="Schließen"
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </aside>
      )}

      {/* Registrierungs-Modal für unbegrenztes Hören bei kostenfreien Produkten */}
      <FullAudioRegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        audioTitle={produkt.titel}
        durationText={`${formatTime(totalDuration)} Minuten`}
        title={`Möchtest du "${produkt.titel}" in voller Länge hören?`}
        subtitle="100% Kostenfreie Freischaltung"
      />
    </>
  );
}
