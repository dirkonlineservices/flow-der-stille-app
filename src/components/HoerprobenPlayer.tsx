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
}

export function HoerprobenPlayer({ produkt }: Props) {
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

  return (
    <div className="mt-4 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-50/60 to-amber-100/30 dark:from-amber-900/20 dark:to-amber-800/10 p-4 shadow-sm">
      {/* Titel-Zeile */}
      <div className="flex items-center gap-2 mb-3">
        <Headphones size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-300 uppercase">
          Kostenlose Hörprobe
        </span>
      </div>

      {/* Audio-Steuerung */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Hörprobe abspielen'}
          className={`w-11 h-11 flex items-center justify-center rounded-full shrink-0 shadow-md active:scale-95 transition-all text-white ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {isPlaying ? (
            <Pause size={18} fill="white" stroke="none" />
          ) : (
            <Play size={18} className="ml-0.5" fill="white" stroke="none" />
          )}
        </button>

        {/* Fortschrittsbalken + Zeit */}
        <div className="flex-1 min-w-0">
          {/* Klickbarer Fortschrittsbalken */}
          <div
            className="relative h-2 bg-amber-200/70 dark:bg-amber-800/40 rounded-full cursor-pointer overflow-hidden mb-1.5"
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
          <div className="flex justify-between text-[10px] text-amber-700/80 dark:text-amber-400/80 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Hinweis */}
      <p className="mt-3 text-[10px] text-amber-700/70 dark:text-amber-400/60 italic text-center">
        Hörprobe – kein Login erforderlich
      </p>

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
