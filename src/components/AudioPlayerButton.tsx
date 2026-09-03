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
import { getPlayableAudioUrl, offlineManager } from '../lib/offlineAudioService';
import { OfflineDownloadButton } from './OfflineDownloadButton';

export function AudioPlayerButton({ produkt, getUrl }: { produkt: any, getUrl: any }) {
  const { user } = useAuth();
  const [rawUrl, setRawUrl] = useState('');
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [offlineAlert, setOfflineAlert] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let isMounted = true;
    async function initUrls() {
      if (!produkt) return;
      try {
        const fetchedUrl = await getUrl(produkt);
        if (!fetchedUrl || !isMounted) return;
        setRawUrl(fetchedUrl);
        const playable = await getPlayableAudioUrl(produkt.id, fetchedUrl, produkt.titel);
        if (isMounted && playable) setResolvedUrl(playable);
      } catch (e) {
        console.warn("Could not pre-fetch audio URL:", e);
      }
    }
    initUrls();
    return () => { isMounted = false; };
  }, [produkt, getUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audio) el.pause();
      });
    };

    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    const handleEnded = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentTime(0);
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: "audio_complete", audio_title: produkt.titel, audio_category: produkt.kategorie });
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [produkt.titel, produkt.kategorie]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    const targetUrl = resolvedUrl || rawUrl;
    if (targetUrl && (!audio.src || audio.src === window.location.href)) {
      audio.src = targetUrl;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("Playback Fehler:", err);
        if (rawUrl && audio.src !== rawUrl) {
          audio.src = rawUrl;
          audio.play().catch((e) => console.error("Fallback play fehlgeschlagen:", e));
        }
      });
    }

    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'audio_play_start', product_id: produkt.id, audio_title: produkt.titel });
    }
  };

  const handlePlayClick = () => {
    // Im Flugmodus / Offline: Wenn offline freigeschaltet oder kostenlos, kein Auth-Modal erzwingen
    const isOfflineOwned = offlineManager.isPurchasedOffline(produkt.id) || parseFloat(produkt.preis) === 0;
    if (!user && !isOfflineOwned) {
      setShowAuthModal(true);
      return;
    }
    const accepted = localStorage.getItem('flow_disclaimer_accepted') === 'true';
    if (!accepted) {
      setShowDisclaimer(true);
      return;
    }

    // Wenn offline / Flugmodus: Prüfen, ob Audio lokal im Cache vorliegt
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const isCachedLocally = resolvedUrl && resolvedUrl.startsWith('blob:');
    if (isOffline && !isCachedLocally) {
      setOfflineAlert('Flugmodus aktiv: Dieses Audio wurde noch nicht offline heruntergeladen. Bitte kurz mit dem Internet verbinden oder gespeicherte Audios nutzen.');
      setTimeout(() => setOfflineAlert(''), 4500);
      return;
    }

    togglePlay();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] my-4 w-full max-w-sm mx-auto shadow-sm min-h-[8rem] h-auto">
        <button 
          onClick={handlePlayClick}
          disabled={isLoading}
          className={`w-20 h-20 flex items-center justify-center rounded-full shadow-md active:scale-95 transition-all text-white border-4 border-[var(--bg-card)] shrink-0 ${
            isLoading
              ? 'bg-[var(--accent)]/70 cursor-not-allowed'
              : isPlaying 
              ? 'bg-[#ef4444] hover:bg-[#dc2626] hover:ring-4 hover:ring-red-200' 
              : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:ring-4 hover:ring-emerald-100'
          }`}
          aria-label={isLoading ? "Wird geladen..." : isPlaying ? "Pause" : "Abspielen"}
        >
          {isLoading ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={32} fill="white" stroke="none" />
          ) : (
            <Play size={32} className="ml-1" fill="white" stroke="none" />
          )}
        </button>

        {offlineAlert && (
          <div className="mt-3 px-3 py-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 text-center leading-snug">
            {offlineAlert}
          </div>
        )}

        <div className="mt-4 text-center select-none w-full">
          <div className="text-xl font-bold text-[var(--text-main)] tracking-wider">
            {isLoading
              ? <span className="text-sm font-medium text-[var(--text-muted)]">Audio wird geladen...</span>
              : <>{formatTime(currentTime)} <span className="text-[var(--text-muted)] font-normal text-sm">/ {formatTime(duration > 0 && isFinite(duration) ? duration : (produkt.dauer || 0))}</span></>
            }
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-medium max-w-[240px] mx-auto break-words leading-normal">{produkt.titel}</div>
        </div>

        {rawUrl && (
          <OfflineDownloadButton
            productId={produkt.id}
            audioUrl={rawUrl}
            title={produkt.titel}
            variant="button"
          />
        )}
        
        <audio ref={audioRef} className="hidden" preload="none" controlsList="nodownload" />
        
        {produkt.audio_hinweis && (
          <p className="text-[10px] text-[var(--text-muted)] mt-3 italic text-center max-w-[280px] leading-normal break-words border-t border-[var(--border)] pt-2 w-full">
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
