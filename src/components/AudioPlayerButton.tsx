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
import { Play, Pause, Loader2 } from 'lucide-react';
import DisclaimerModal from './DisclaimerModal';
import AuthRequiredModal from './AuthRequiredModal';
import { useAuth } from '../context/AuthContext';
import { getPlayableAudioUrl } from '../lib/offlineAudioService';
import { OfflineDownloadButton } from './OfflineDownloadButton';

export function AudioPlayerButton({ produkt, getUrl }: { produkt: any, getUrl: any }) {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [rawUrl, setRawUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Ladeindikator beim ersten Play
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Nur die raw URL vorab holen (für Offline-Button Status-Check) –
  // KEINE signed URL prefetchen, kein src-Setzen → kein Egress-Verbrauch
  useEffect(() => {
    let isMounted = true;
    async function initRawUrl() {
      if (!produkt) return;
      try {
        const fetchedUrl = await getUrl(produkt);
        if (fetchedUrl && isMounted) {
          setRawUrl(fetchedUrl);
          // url bleibt leer – wird erst bei erstem Play gesetzt
        }
      } catch (e) {
        console.warn("Could not pre-fetch raw audio URL:", e);
      }
    }
    initRawUrl();
    return () => { isMounted = false; };
  }, [produkt, getUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
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

    // Pause → direkt, kein Laden nötig
    if (!audio.paused) {
      audio.pause();
      return;
    }

    let targetUrl = url;
    if (!targetUrl) {
      setIsLoading(true);
      try {
        const activeUrl = rawUrl || await getUrl(produkt);
        if (!activeUrl) {
          console.error("Keine gültige Audio-URL gefunden.");
          setIsLoading(false);
          return;
        }
        setRawUrl(activeUrl);
        // ⚡ Sichere Sandbox-Auflösung (lokaler Blob im Flugmodus oder Remote-URL mit Cache)
        targetUrl = await getPlayableAudioUrl(produkt.id, activeUrl, produkt.titel);
        setUrl(targetUrl);
      } catch (error) {
        console.error("Ladefehler:", error);
        setIsLoading(false);
        return;
      }
    }

    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
      audio.load();
      audio.oncanplay = () => {
        setIsLoading(false);
        audio.play().catch(err => console.error("Autoplay geblockt:", err));
        audio.oncanplay = null;
      };
    } else if (audio.paused) {
      setIsLoading(false);
      audio.play().catch(err => console.error("Playback Fehler:", err));
    }

    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "audio_play", audio_title: produkt.titel, audio_category: produkt.kategorie });
    }
  };

  const handlePlayClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const accepted = localStorage.getItem('flow_disclaimer_accepted') === 'true';
    if (!accepted) {
      setShowDisclaimer(true);
      return;
    }
    togglePlay();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] my-4 w-full max-w-sm mx-auto shadow-sm">
        <button 
          onClick={handlePlayClick}
          disabled={isLoading}
          className={`w-20 h-20 flex items-center justify-center rounded-full shadow-md active:scale-95 transition-all text-white border-4 border-[var(--bg-card)] ${
            isLoading
              ? 'bg-[var(--accent)]/70 cursor-not-allowed'
              : isPlaying 
              ? 'bg-[#ef4444] hover:bg-[#dc2626] hover:ring-4 hover:ring-red-200' 
              : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:ring-4 hover:ring-emerald-100'
          }`}
          aria-label={isLoading ? "Wird geladen…" : isPlaying ? "Pause" : "Abspielen"}
        >
          {isLoading ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={32} fill="white" stroke="none" />
          ) : (
            <Play size={32} className="ml-1" fill="white" stroke="none" />
          )}
        </button>

        <div className="mt-4 text-center select-none w-full">
          <div className="text-xl font-bold text-[var(--text-main)] tracking-wider">
            {isLoading
              ? <span className="text-sm font-medium text-[var(--text-muted)]">Audio wird geladen…</span>
              : <>{formatTime(currentTime)} <span className="text-[var(--text-muted)] font-normal text-sm">/ {formatTime(duration > 0 && isFinite(duration) ? duration : (produkt.dauer || 0))}</span></>
            }
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-medium max-w-[240px] mx-auto truncate">{produkt.titel}</div>
        </div>

        {/* Schalter für Offline-Verfügbarkeit im Flugmodus */}
        {rawUrl && (
          <OfflineDownloadButton
            productId={produkt.id}
            audioUrl={rawUrl}
            title={produkt.titel}
            variant="button"
          />
        )}
        
        {/* Audio-Element ohne src + preload=none → kein Byte-Transfer bis Play */}
        <audio ref={audioRef} className="hidden" preload="none" controlsList="nodownload" />
        
        {/* Dynamisches KI-Label */}
        {produkt.audio_hinweis && (
          <p className="text-[10px] text-[var(--text-muted)] mt-3 italic text-center max-w-[280px] leading-normal border-t border-[var(--border)] pt-2 w-full">
            {produkt.audio_hinweis}
          </p>
        )}
      </div>

      <DisclaimerModal 
        isOpen={showDisclaimer} 
        onAccepted={() => {
          setShowDisclaimer(false);
          togglePlay();
        }} 
      />

      <AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}