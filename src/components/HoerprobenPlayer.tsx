/**
 * HoerprobenPlayer – Kostenlose Klangprobe für alle Produkte.
 *
 * - Mit hoerprobe_url: öffentliche Hörprobe, wird direkt abgespielt.
 * - Ohne hoerprobe_url, aber Gratis-Produkt (preis = 0): Auszug aus der Vollversion
 *   über das geschützte Streaming (Login nötig, Freischaltung erfolgt automatisch).
 * - Ohne hoerprobe_url bei Bezahlprodukten: kein Player (Vollversion ist geschützt).
 * Bei Vollversionen werden die ersten 70 Sek. (1:10 Min.) übersprungen,
 * sodass direkt die beruhigende Klangprobe (90 Sek.) ertönt.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Headphones, Loader2 } from 'lucide-react';
import { useAudioConsentGate } from './AudioConsentModal';
import { useAuth } from '../context/AuthContext';
import { useProtectedStream } from '../hooks/useProtectedStream';
import { isFreeProduct } from '../lib/audioStream';

interface Props {
  /** Das komplette Produkt-Objekt aus Supabase */
  produkt: any;
  /** Variante für Darstellung: 'compact' (platzsparend für Mobile/Listen) oder 'full' */
  variant?: 'compact' | 'full';
  /** Optionaler Button "Zum Produkt" mit Anchor-Scroll */
  showProductLink?: boolean;
  /** Callback beim Klick auf "Zum Produkt" */
  onProductClick?: (productId: string) => void;
  autoPlay?: boolean;
  enableFloatingPlayer?: boolean;
}

/** Hat das Produkt eine abspielbare Hörprobe (öffentlich oder Gratis-Vollversion)? */
export function hasHoerprobe(produkt: any): boolean {
  const publicUrl = typeof produkt?.hoerprobe_url === 'string' && produkt.hoerprobe_url.trim() !== '';
  return publicUrl || isFreeProduct(produkt);
}

export function HoerprobenPlayer({ produkt, variant = 'compact', showProductLink = false, onProductClick }: Props) {
  const { user } = useAuth();
  // Öffentliche, eigens geschnittene Hörprobe (bleibt frei abspielbar)
  const publicUrl: string = (produkt?.hoerprobe_url && typeof produkt.hoerprobe_url === 'string' && produkt.hoerprobe_url.trim() !== '')
    ? produkt.hoerprobe_url.trim()
    : '';
  // Ohne öffentliche Hörprobe nur bei Gratis-Produkten: Auszug über geschütztes Streaming
  const useProtected = !publicUrl && isFreeProduct(produkt);
  const stream = useProtectedStream(useProtected ? produkt : null);

  // Startzeit bestimmen:
  // - Wenn eigens geschnittene hoerprobe_url vorhanden: 0
  // - Spezialfall Schmetterling: 79 Sek. (Kapitel 1 Beginn)
  // - Wenn kurzes Audio (< 90 Sek., z. B. Atemübung): 0
  // - Standard für alle Hauptaudios: 70 Sek. (1:10 Min.), um den gesprochenen Disclaimer zu überspringen!
  const getStartTime = () => {
    if (produkt?.hoerprobe_url && typeof produkt.hoerprobe_url === 'string' && produkt.hoerprobe_url.trim() !== '') {
      return 0;
    }
    if (produkt?.id === 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte') {
      return 79;
    }
    if (produkt?.id === 'rauhnaechte' || (produkt?.titel && produkt.titel.toLowerCase().includes('rauhn'))) {
      return 62; // Nach 1:02 Min. Hinweis direkt ins Vorwort & Meditation
    }
    const dur = Number(produkt?.dauer) || 0;
    if (dur > 0 && dur < 90) {
      return 0;
    }
    return 70; // 1:10 Min.
  };

  const startTime = getStartTime();
  const SNIPPET_DURATION = 90; // 90 Sekunden Auszug

  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(Number(produkt?.dauer) || 0);

  // Consent-Gate: öffnet sich beim ersten Klick wenn noch nicht zugestimmt
  const { gate, requestPlay } = useAudioConsentGate();

  // Nichts rendern, wenn weder öffentliche Hörprobe noch Gratis-Vollversion vorhanden ist
  if (!publicUrl && !useProtected) return null;

  const actualSnippetDuration = Math.min(
    SNIPPET_DURATION, 
    Math.max(15, (duration || Number(produkt?.dauer) || 120) - startTime)
  );

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

    // Alle anderen Audio-Elemente pausieren
    document.querySelectorAll('audio').forEach((el) => {
      if (el !== audio) el.pause();
    });

    // Über das Consent-Gate routen
    requestPlay('sample', produkt.titel, async () => {
      if (useProtected) {
        if (!user) {
          stream.requireLogin();
          return;
        }
        const outsideSnippet = audio.currentTime < startTime || audio.currentTime >= startTime + actualSnippetDuration;
        setIsLoading(true);
        const started = await stream.play(audio, outsideSnippet ? { startAt: startTime } : {});
        if (!started) setIsLoading(false);
        else setIsPlaying(true);
      } else {
        if (!audio.src || audio.src === window.location.href) {
          audio.src = publicUrl;
        }

        // Falls die Position vor dem Startzeitpunkt liegt oder den Ausschnitt überschritten hat
        if (audio.currentTime < startTime || audio.currentTime >= startTime + actualSnippetDuration) {
          audio.currentTime = startTime;
          setCurrentTime(startTime);
        }

        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error('Audio play error:', err?.name));
      }

      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'hoerprobe_play',
          audio_title: produkt.titel,
          audio_category: produkt.kategorie,
          has_skipped_disclaimer: startTime > 0,
        });
      }
    });
  };

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
      {/* Consent-Gate Modal (rendert nur wenn nötig) */}
      {gate}
      {useProtected && stream.modals}

      <div className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs transition-all ${variant === 'compact' ? 'p-3.5 sm:p-4' : 'p-5'}`}>
        {/* Header-Zeile mit Titel, Disclaimer-Skip-Badge, Offline-Icon und optionalem "Zum Produkt"-Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Headphones size={14} />
            </span>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-main)] leading-snug">
                Kostenlose Klangprobe:
              </span>
              <span className="font-serif italic font-normal text-xs sm:text-sm text-[var(--text-muted)] truncate max-w-[180px] sm:max-w-none">
                {produkt.titel}
              </span>
              {startTime > 0 && (
                <span 
                  title="Spielt direkt den beruhigenden Inhalt ab – der rechtliche Hinweis vorab wird übersprungen."
                  className="text-[10px] font-mono text-[var(--accent)] font-semibold bg-[var(--accent)]/10 px-2 py-0.5 rounded-full border border-[var(--accent)]/25 whitespace-nowrap cursor-help"
                >
                  Auszug ab {formatTime(startTime)} Min.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
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
            onClick={togglePlay}
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

        {/* Audio-Element mit preload="none" */}
        <audio
          ref={audioRef}
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          onError={useProtected ? stream.onAudioError : undefined}
          preload="none"
          className="hidden"
          onTimeUpdate={() => {
            if (audioRef.current) {
              const cur = audioRef.current.currentTime;
              setCurrentTime(cur);
              // Nach Ablauf des 90-Sekunden-Ausschnitts automatisch stoppen
              if (cur >= startTime + actualSnippetDuration) {
                audioRef.current.pause();
                audioRef.current.currentTime = startTime;
                setCurrentTime(startTime);
                setIsPlaying(false);
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
          onPlay={() => { setIsPlaying(true); setIsLoading(false); }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onEnded={() => {
            setIsPlaying(false);
            setIsLoading(false);
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
    </>
  );
}
