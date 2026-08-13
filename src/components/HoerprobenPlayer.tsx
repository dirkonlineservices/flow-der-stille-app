/**
 * HoerprobenPlayer – Kostenlose Hörprobe für ein Produkt.
 *
 * Voraussetzung Supabase-Spalte: `public.produkte.hoerprobe_url` (text, nullable)
 * Wenn der Wert NULL oder leer ist, rendert diese Komponente NICHTS.
 * Kein Login erforderlich – Hörproben sind öffentlich zugänglich.
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
    <div className={`rounded-xl border border-amber-400/30 bg-amber-50/70 dark:bg-amber-950/30 shadow-xs transition-all ${variant === 'compact' ? 'p-3' : 'p-4'}`}>
      {/* Header-Zeile mit Titel */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Headphones size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-[11px] font-bold tracking-wide text-amber-800 dark:text-amber-300 uppercase truncate">
            Kostenlose Hörprobe: {produkt.titel}
          </span>
        </div>

        {showProductLink && (
          <button
            onClick={scrollToProduct}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all shrink-0 cursor-pointer shadow-xs"
          >
            Zum Produkt →
          </button>
        )}
      </div>

      {/* Audio-Steuerung */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Hörprobe abspielen'}
          className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 shadow-sm active:scale-95 transition-all text-white cursor-pointer ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {isPlaying ? (
            <Pause size={16} fill="white" stroke="none" />
          ) : (
            <Play size={16} className="ml-0.5" fill="white" stroke="none" />
          )}
        </button>

        {/* Fortschrittsbalken + Zeit */}
        <div className="flex-1 min-w-0">
          <div
            className="relative h-2 bg-amber-200/80 dark:bg-amber-900/60 rounded-full cursor-pointer overflow-hidden mb-1"
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute left-0 top-0 h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-amber-800/80 dark:text-amber-300/80 font-mono">
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
