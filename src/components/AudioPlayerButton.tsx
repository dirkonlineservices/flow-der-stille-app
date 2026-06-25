/* =========================================================================================
🚨 AI SYSTEM INSTRUCTION - STRICT GUARDRAIL - DO NOT MODIFY 🚨
This component contains critical, cross-component audio logic.
CRITICAL SYSTEMS INSIDE:
1. Native DOM-Event Listeners (play/pause) for Global Multitasking Protection.
2. Custom GA4 Tracking hooks (audio_play, audio_complete).
3. Dynamic Supabase label fetching (audio_hinweis).

DO NOT apply generic "Defensive Checks", DO NOT alter the useEffect hooks, and 
DO NOT modify the asynchronous URL loading logic. Read-only permitted.
=========================================================================================
*/

import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export function AudioPlayerButton({ produkt, getUrl }: { produkt: any, getUrl: any }) {
  const [url, setUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    // ⚡ FIX: Globale Pause-Logik! Stoppt alle anderen Player auf der Webseite.
    const handlePlay = () => {
      setIsPlaying(true);
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach((el) => {
        if (el !== audio) {
          el.pause();
        }
      });
    };

    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: "audio_complete", audio_title: produkt.titel, audio_category: produkt.kategorie });
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [produkt.titel, produkt.kategorie]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (!url) {
      try {
        const activeUrl = await getUrl(produkt);
        if (!activeUrl) {
          console.error("Keine gültige Audio-URL gefunden.");
          return;
        }
        
        setUrl(activeUrl);
        audio.src = activeUrl; 
        audio.load();
        
        audio.oncanplay = () => {
          audio.play().catch(err => console.error("Autoplay geblockt:", err));
          audio.oncanplay = null; // cleanup
        };
        
        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({ event: "audio_play", audio_title: produkt.titel, audio_category: produkt.kategorie });
        }
      } catch (error) {
         console.error("Ladefehler:", error);
      }
      return;
    }
    
    if (audio.paused) {
      audio.play().catch(err => console.error("Playback Fehler:", err));
    } else {
      audio.pause();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] my-4 w-full max-w-sm mx-auto shadow-sm">
      <button 
        onClick={togglePlay}
        className={`w-20 h-20 flex items-center justify-center rounded-full shadow-md active:scale-95 transition-all text-white border-4 border-[var(--bg-card)] ${
          isPlaying 
            ? 'bg-[#ef4444] hover:bg-[#dc2626] hover:ring-4 hover:ring-red-200' 
            : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:ring-4 hover:ring-emerald-100'
        }`}
        aria-label={isPlaying ? "Pause" : "Abspielen"}
      >
        {isPlaying ? (
          <Pause size={32} fill="white" stroke="none" />
        ) : (
          <Play size={32} className="ml-1" fill="white" stroke="none" />
        )}
      </button>
      <div className="mt-4 text-center select-none">
        <div className="text-xl font-bold text-[var(--text-main)] tracking-wider">
          {formatTime(currentTime)} <span className="text-[var(--text-muted)] font-normal text-sm">/ {formatTime(duration || produkt.dauer || 0)}</span>
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-medium max-w-[240px] truncate">{produkt.titel}</div>
      </div>
      
      {/* ⚡ FIX: Das Audio-Element MUSS immer gerendert werden */}
      <audio ref={audioRef} src={url || undefined} className="hidden" preload="metadata" />
      
      {/* Dynamisches KI-Label */}
      {produkt.audio_hinweis && (
        <p className="text-[10px] text-[var(--text-muted)] mt-3 italic text-center max-w-[280px] leading-normal border-t border-[var(--border)] pt-2 w-full">
          {produkt.audio_hinweis}
        </p>
      )}
    </div>
  );
}