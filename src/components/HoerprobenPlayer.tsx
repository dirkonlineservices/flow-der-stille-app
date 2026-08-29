/**
 * HoerprobenPlayer – Kostenlose Hörprobe für ein Produkt.
 *
 * Farbzusammenstellung im Marken-CI (Salbeigrün & Grün, keine Knall-Farben).
 * Dynamischer, vollbreitenausfüllender Fortschrittsbalken ohne leere Freiräume.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Headphones, Loader2 } from 'lucide-react';
import { getPlayableAudioUrl } from '../lib/offlineAudioService';
import { OfflineDownloadButton } from './OfflineDownloadButton';
import { useAudioConsentGate } from './AudioConsentModal';

interface Props {
  /** Das komplette Produkt-Objekt aus Supabase */
  produkt: any;
  /** Variante für Darstellung: 'compact' (platzsparend für Mobile/Listen) oder 'full' */
  variant?: 'compact' | 'full';
  /** Optionaler Button "Zum Produkt" mit Anchor-Scroll */
  showProductLink?: boolean;
  /** Callback beim Klick auf "Zum Produkt" */
  onProductClick?: (productId: string) => void;
}

export function HoerprobenPlayer({ produkt, variant = 'compact', showProductLink = false, onProductClick }: Props) {
  const rawUrl: string = produkt?.hoerprobe_url ?? '';
  const [audioUrl, setAudioUrl] = useState<string>(rawUrl);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Consent-Gate: öffnet sich beim ersten Klick wenn noch nicht zugestimmt
  const { gate, requestPlay } = useAudioConsentGate();

  useEffect(() => {
    let isMounted = true;
    async function resolveAudio() {
      if (!rawUrl) return;
      try {
        const playable = await getPlayableAudioUrl(`hoerprobe_${produkt.id}`, rawUrl, `Hörprobe: ${produkt.titel}`);
        if (isMounted && playable) setAudioUrl(playable);
      } catch (e) {
        console.warn('Could not resolve offline audio for hoerprobe:', e);
      }
    }
    resolveAudio();
    return () => { isMounted = false; };
  }, [rawUrl, produkt.id, produkt.titel]);

  // Nichts rendern, wenn keine Hörprobe vorhanden
  if (!rawUrl) return null;

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
      // Pause ist nicht Consent-pflichtig – direkt ausführen
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Alle anderen Audio-Elemente pausieren
    document.querySelectorAll('audio').forEach((el) => {
      if (el !== audio) el.pause();
    });

    // Über das Consent-Gate routen (öffnet Modal beim ersten Mal)
    requestPlay('sample', produkt.titel, () => {
      const srcToPlay = audioUrl || rawUrl;
      if (!audio.src || audio.src === '' || audio.src === window.location.href) {
        audio.src = srcToPlay;
      }

      setIsLoading(true);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false);
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error('Audio play error:', err);
            setIsLoading(false);
            // Fallback auf die direkte Roh-URL falls Blob fehlschlägt
            if (rawUrl && audio.src !== rawUrl) {
              audio.src = rawUrl;
              audio.play().then(() => setIsPlaying(true)).catch((e) => console.error('Fallback play failed:', e));
            }
          });
      }

      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'hoerprobe_play',
          audio_title: produkt.titel,
          audio_category: produkt.kategorie,
        });
      }
    });
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
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
      {/* Consent-Gate Modal (rendert nur wenn nötig) */}
      {gate}

      <div className={`w-full rounded-2xl border border-[var(--color-border-main)] bg-[var(--color-bg-card)] shadow-xs transition-all ${variant === 'compact' ? 'p-3.5 sm:p-4' : 'p-5'}`}>
      {/* Header-Zeile mit Titel, Offline-Icon und optionalem "Zum Produkt"-Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Headphones size={14} />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-main)] leading-snug break-words">
            Kostenlose Hörprobe: <span className="font-serif italic font-normal text-[var(--color-text-muted)]">{produkt.titel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <OfflineDownloadButton
            productId={`hoerprobe_${produkt.id}`}
            audioUrl={rawUrl}
            title={`Hörprobe: ${produkt.titel}`}
            variant="icon"
          />

          {showProductLink && (
            <button
              onClick={scrollToProduct}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              Zum Produkt →
            </button>
          )}
        </div>
      </div>

      {/* Audio-Steuerung: Play Button + Vollbreiten-Fortschrittsbalken */}
      <div className="flex items-center gap-3 w-full">
        {/* Play/Pause Button mit Lade-Indikator */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isLoading ? 'Wird geladen…' : isPlaying ? 'Pause' : 'Hörprobe abspielen'}
          className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 shadow-sm active:scale-95 transition-all text-white ${
            isLoading
              ? 'bg-[var(--color-accent-primary)]/60 cursor-not-allowed'
              : isPlaying
              ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
              : 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] cursor-pointer'
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
            className="relative h-2.5 bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] rounded-full cursor-pointer overflow-hidden mb-1.5"
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Ladepuls-Animation wenn noch kein Buffer */}
            {isLoading && (
              <div className="absolute inset-0 bg-[var(--color-accent-primary)]/30 animate-pulse rounded-full" />
            )}
            <div
              className="absolute left-0 top-0 h-full bg-[var(--color-accent-primary)] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] font-mono font-medium">
            <span>{isLoading ? 'Lädt…' : formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Audio-Element mit preload="none" – kein Byte-Download bis Play geklickt wird */}
      <audio
        ref={audioRef}
        src={audioUrl || rawUrl}
        controlsList="nodownload"
        preload="none"
        className="hidden"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
              event: 'hoerprobe_complete',
              audio_title: produkt.titel,
            });
          }
        }}
      />
    </div>
    </>
  );
}
