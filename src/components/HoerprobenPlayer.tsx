/**
 * HoerprobenPlayer – Kostenlose Hörprobe für ein Produkt.
 *
 * Farbzusammenstellung im Marken-CI (Salbeigrün & Grün, keine Knall-Farben).
 * Sehr kompakte, schlanke Darstellung ohne gedrungenen Vollbreiten-Balken.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';

interface Props {
  /** Das komplette Produkt-Objekt aus Supabase */
  produkt: any;
  /** Variante für Darstellung: 'compact' (platzsparend für Mobile/Listen) oder 'full' */
  variant?: 'compact' | 'full';
  /** Optionaler Button "Zum Produkt" mit Anchor-Scroll */
  showProductLink?: boolean;
}

export function HoerprobenPlayer({ produkt, variant = 'compact', showProductLink = false }: Props) {
  const url: string = produkt?.hoerprobe_url ?? '';
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Nichts rendern, wenn keine Hörprobe vorhanden
  if (!url) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Alle anderen Audio-Elemente pausieren
    document.querySelectorAll('audio').forEach((el) => {
      if (el !== audio) el.pause();
    });

    if (audio.paused) {
      audio.play().catch(() => {});
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'hoerprobe_play',
          audio_title: produkt.titel,
          audio_category: produkt.kategorie,
        });
      }
    } else {
      audio.pause();
    }
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
    const el = document.getElementById(`product-${produkt.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.location.hash = `product-${produkt.id}`;
    }
  };

  return (
    <div className={`rounded-2xl border border-[var(--color-border-main)] bg-[var(--color-bg-card)] shadow-xs transition-all ${variant === 'compact' ? 'p-3.5' : 'p-5'}`}>
      {/* Header-Zeile mit Titel */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] flex items-center justify-center shrink-0">
            <Headphones size={13} />
          </span>
          <span className="text-xs font-semibold text-[var(--color-text-main)] truncate">
            Kostenlose Hörprobe: <span className="font-serif italic font-normal text-[var(--color-text-muted)]">{produkt.titel}</span>
          </span>
        </div>

        {showProductLink && (
          <button
            onClick={scrollToProduct}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
          >
            Zum Produkt →
          </button>
        )}
      </div>

      {/* Audio-Steuerung: Kompakter Play Button + zentrierter Fortschrittsbalken */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Hörprobe abspielen'}
          className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 shadow-sm active:scale-95 transition-all text-white cursor-pointer ${
            isPlaying ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)]'
          }`}
        >
          {isPlaying ? (
            <Pause size={15} fill="white" stroke="none" />
          ) : (
            <Play size={15} className="ml-0.5" fill="white" stroke="none" />
          )}
        </button>

        {/* Fortschrittsbalken + Zeit (kompakt begrenzt) */}
        <div className="flex-1 max-w-sm min-w-0">
          <div
            className="relative h-2 bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] rounded-full cursor-pointer overflow-hidden mb-1"
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute left-0 top-0 h-full bg-[var(--color-accent-primary)] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Verstecktes Audio-Element */}
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
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
  );
}
