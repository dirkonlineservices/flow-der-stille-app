/**
 * AdventAudioPlayer – Streaming-Player für die kostenfreien Aufnahmen hinter den
 * Türchen des Adventskalenders (öffentlicher Bucket fds-public, siehe config/audio.ts).
 *
 * Reines Streaming: kein Download-Knopf, kein Kontextmenü auf dem Audio-Element.
 * Die Quelle wird erst beim ersten Abspielen geladen (preload="none").
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Headphones, Loader2 } from 'lucide-react';

interface Props {
  src: string;
  /** Kurze Beschreibung, z. B. „Geführte Meditation“ */
  label: string;
  /** Titel für die Sperrbildschirm-Steuerung */
  title: string;
}

const formatTime = (secs: number) => {
  if (!Number.isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function AdventAudioPlayer({ src, label, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  // Beim Wechsel des Türchens: Anzeige zurücksetzen. Beim Wechsel oder Schließen: Wiedergabe beenden.
  useEffect(() => {
    const audio = audioRef.current;
    setPlaying(false);
    setLoading(false);
    setError(false);
    setCurrent(0);
    setDuration(0);
    return () => {
      audio?.pause();
    };
  }, [src]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setError(false);
    setLoading(true);
    try {
      await audio.play();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: 'Flow der Stille | Adventskalender',
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setCurrent(audio.currentTime);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#8A9A8A]/50 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Wiedergabe pausieren' : 'Aufnahme abspielen'}
          className="w-14 h-14 shrink-0 rounded-full bg-[#344034] hover:bg-[#2A342A] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : playing ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#344034]">
            <Headphones className="w-3.5 h-3.5" />
            Zum Anhören
          </div>
          <p className="text-sm sm:text-base font-semibold text-stone-950 truncate">{label}</p>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={Math.min(current, duration || 0)}
            onChange={seek}
            disabled={!duration}
            aria-label="Position in der Aufnahme"
            className="w-full mt-2 accent-[#344034] cursor-pointer disabled:cursor-default"
          />
          <div className="flex justify-between text-xs text-stone-700 tabular-nums">
            <span>{formatTime(current)}</span>
            <span>{duration ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-stone-800">
          Die Aufnahme konnte gerade nicht geladen werden. Bitte versuche es gleich noch einmal.
        </p>
      )}

      <audio
        ref={audioRef}
        src={src}
        preload="none"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}

export default AdventAudioPlayer;
