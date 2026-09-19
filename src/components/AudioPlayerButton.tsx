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
      // iOS-FIX: Nach src-Wechsel load() aufrufen, sonst schlägt play() fehl
      audio.load();
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("Playback Fehler:", err);
        if (rawUrl && audio.src !== rawUrl) {
          audio.src = rawUrl;
          // iOS-FIX: Auch im Fallback load() aufrufen
          audio.load();
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
      <div className="w-full max-w-xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] my-3 shadow-xs space-y-2.5">
        {/* Hauptzeile: Kompakter Play-Button (48x48px) + Titel, Zeit, Fortschritt + Offline-Download */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePlayClick}
            disabled={isLoading}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm active:scale-95 transition-all text-white shrink-0 cursor-pointer ${
              isLoading
                ? 'bg-[var(--accent)]/70 cursor-not-allowed'
                : isPlaying 
                ? 'bg-[#ef4444] hover:bg-[#dc2626]' 
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
            }`}
            aria-label={isLoading ? "Wird geladen..." : isPlaying ? "Pause" : "Abspielen"}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} fill="white" stroke="none" />
            ) : (
              <Play size={20} className="ml-0.5" fill="white" stroke="none" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-main)] truncate">
                {produkt.titel}
              </h4>
              <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] shrink-0">
                {isLoading
                  ? 'Lädt…'
                  : <>{formatTime(currentTime)} / {formatTime(duration > 0 && isFinite(duration) ? duration : (produkt.dauer || 0))}</>
                }
              </span>
            </div>

            {/* Schlanker Fortschrittsbalken */}
            <div className="h-1.5 w-full bg-[var(--border)] rounded-full mt-2 overflow-hidden relative">
              <div 
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-200"
                style={{ 
                  width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` 
                }}
              />
            </div>
          </div>

          {rawUrl && (
            <div className="shrink-0">
              <OfflineDownloadButton
                productId={produkt.id}
                audioUrl={rawUrl}
                title={produkt.titel}
                variant="icon"
              />
            </div>
          )}
        </div>

        {offlineAlert && (
          <div className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 text-center leading-snug">
            {offlineAlert}
          </div>
        )}

        <audio ref={audioRef} className="hidden" preload="none" controlsList="nodownload" />

        {produkt.audio_hinweis && (
          <p className="text-[10px] text-[var(--text-muted)] italic leading-normal border-t border-[var(--border)] pt-1.5">
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
