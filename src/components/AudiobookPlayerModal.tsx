/**
 * AudiobookPlayerModal.tsx – Spezialisierter Hörbuch-Player für lange Audios (z. B. 58:43 Min).
 *
 * Features:
 * - Exakter Zeitstrahl (Scroller/Timeline) für präzises Vor- und Zurückspringen.
 * - Kapitel-Navigation (Schnellfinder für Kapitel 1, 2, 3, 4 etc.).
 * - Automatischer Speicherstand (Fortschritt merken & an letzter Stelle weiterhören).
 * - Vor- und Zurückspulen um 15 Sekunden.
 * - Geschützte Offline-Funktion (Flugmodus) über den internen App-Speicher.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Bookmark, CheckCircle2, ListMusic, Sparkles, HardDrive, WifiOff, Clock,
  Lock, AlertCircle, Shield
} from 'lucide-react';
import { getPlayableAudioUrl } from '../lib/offlineAudioService';
import { OfflineDownloadButton } from './OfflineDownloadButton';

export interface AudiobookChapter {
  id: string;
  title: string;
  startTime: number; // in Sekunden (z. B. 0, 79, 1147, 2177, 2975)
  formattedTime: string; // z. B. "00:00", "01:19", "19:07", "36:17", "49:35"
  duration?: string; // z. B. "1:19 Min", "17:48 Min"
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  title: string;
  author?: string;
  reader?: string;
  coverImage?: string;
  audioUrl: string;
  durationSeconds?: number; // z. B. 3523 für 58:43 Min
  chapters?: AudiobookChapter[];
  initialStartTime?: number;
}

const DEFAULT_CHAPTERS: AudiobookChapter[] = [
  { 
    id: 'intro', 
    title: 'Einleitung und rechtlicher Hinweis', 
    startTime: 0, 
    formattedTime: '00:00',
    duration: '1:19 Min'
  },
  { 
    id: 'ch1', 
    title: 'Kapitel 1: Warum der Übergang erst der Anfang ist', 
    startTime: 79, 
    formattedTime: '01:19',
    duration: '17:48 Min'
  },
  { 
    id: 'ch2', 
    title: 'Kapitel 2: Der Übergang: Wenn Wissenschaft auf Spiritualität trifft', 
    startTime: 1147, 
    formattedTime: '19:07',
    duration: '17:10 Min'
  },
  { 
    id: 'ch3', 
    title: 'Kapitel 3: Die andere Ebene: Jenseits des schweren Kostüms', 
    startTime: 2177, 
    formattedTime: '36:17',
    duration: '13:18 Min'
  },
  { 
    id: 'ch4', 
    title: 'Kapitel 4: Das Erwachen im Hier und Jetzt: Die Befreiung zum Leben', 
    startTime: 2975, 
    formattedTime: '49:35',
    duration: '9:08 Min'
  },
];

export function AudiobookPlayerModal({
  isOpen,
  onClose,
  productId,
  title,
  author = 'Jacqueline Schmetzer',
  reader = 'Lisa Ragusa',
  coverImage = '/images/products/cover_schmetterling.jpg',
  audioUrl,
  durationSeconds = 3523,
  chapters = DEFAULT_CHAPTERS,
  initialStartTime
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const milestonesRef = useRef({ 25: false, 50: false, 75: false, 100: false });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(durationSeconds);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playableUrl, setPlayableUrl] = useState<string>(audioUrl);
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0]?.id || '');
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Schutz-Mechanismus für den rechtlichen Hinweis (Disclaimer bis 01:19 Min. = 79 Sek.)
  const DISCLAIMER_DURATION = 79;
  const DISCLAIMER_KEY = `fds_audiobook_disclaimer_listened_${productId}`;
  const [hasListenedDisclaimer, setHasListenedDisclaimer] = useState<boolean>(() => {
    return localStorage.getItem(DISCLAIMER_KEY) === 'true';
  });
  const [disclaimerNotice, setDisclaimerNotice] = useState<string | null>(null);

  const PROGRESS_KEY = `fds_audiobook_progress_${productId}`;

  // 1. Audio-URL auflösen (Sandbox Cache oder Direkt-URL) & Startposition
  useEffect(() => {
    if (!isOpen || !audioUrl) return;

    let isMounted = true;
    setPlayableUrl(audioUrl);

    getPlayableAudioUrl(productId, audioUrl, title).then((resolvedUrl) => {
      if (isMounted && resolvedUrl) {
        setPlayableUrl(resolvedUrl);
      }
    }).catch(() => {
      if (isMounted) setPlayableUrl(audioUrl);
    });

    const isDisclaimerListened = localStorage.getItem(DISCLAIMER_KEY) === 'true';

    // Falls initialStartTime mitgegeben wurde und Disclaimer schon gehört: direkt anspringen
    if (initialStartTime && initialStartTime > 0 && isDisclaimerListened) {
      setCurrentTime(initialStartTime);
      if (audioRef.current) {
        audioRef.current.currentTime = initialStartTime;
      }
    } else {
      // Wenn der Disclaimer noch nicht gehört wurde: ZWINGEND bei 00:00 starten!
      if (!isDisclaimerListened) {
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      } else {
        // Gespeicherte Hörposition NUR anbieten, wenn Disclaimer schon gehört wurde
        const saved = localStorage.getItem(PROGRESS_KEY);
        if (saved) {
          const pos = parseFloat(saved);
          if (!isNaN(pos) && pos > 10 && pos < durationSeconds - 30) {
            setSavedPosition(pos);
            setShowResumeBanner(true);
          }
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, productId, audioUrl, initialStartTime]);

  // 2. MediaSession API (Hintergrund-Wiedergabe, Sperrbildschirm & Einschlaf-Kompatibilität)
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: `${author} • Sprecherin: ${reader}`,
        album: 'Flow der Stille',
        artwork: [
          { src: coverImage, sizes: '512x512', type: 'image/jpeg' },
          { src: coverImage, sizes: '256x256', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        skipSeconds(-15);
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        skipSeconds(15);
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.warn('MediaSession initialization warning:', e);
    }
  }, [isOpen, title, author, reader, coverImage]);

  // 3. Event Listener für Audio-Element & GA4-Milestone Tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Aktuelles Kapitel ermitteln
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (cur >= chapters[i].startTime) {
          setActiveChapterId(chapters[i].id);
          break;
        }
      }

      // Disclaimer Prüfung: Ab Sekunde 79 (01:19 Min.) gilt der rechtliche Hinweis als gehört
      if (cur >= DISCLAIMER_DURATION && !hasListenedDisclaimer) {
        setHasListenedDisclaimer(true);
        localStorage.setItem(DISCLAIMER_KEY, 'true');
      }

      // GA4 Meilenstein-Tracking (25%, 50%, 75%)
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        const pct = Math.round((cur / audio.duration) * 100);
        ([25, 50, 75] as const).forEach((m) => {
          if (pct >= m && !milestonesRef.current[m]) {
            milestonesRef.current[m] = true;
            if ((window as any).dataLayer) {
              (window as any).dataLayer.push({
                event: 'fds_audio_progress',
                audio_action: `progress_${m}`,
                audio_id: productId,
                audio_title: title,
                audio_category: 'Hörbuch',
                audio_percent: m,
                audio_current_time: Math.round(cur),
                audio_duration: Math.round(audio.duration),
                timestamp: new Date().toISOString()
              });
            }
          }
        });
      }

      // Fortschritt alle 3 Sekunden in localStorage sichern
      if (Math.floor(cur) % 3 === 0 && cur > 5) {
        localStorage.setItem(PROGRESS_KEY, cur.toString());
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlayEvent = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handlePauseEvent = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    // Ende des Hörbuchs: Garantierter Einmal-Durchlauf (kein Endlos-Loop)
    const handleEnded = () => {
      setIsPlaying(false);
      localStorage.removeItem(PROGRESS_KEY);

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }

      // GA4 Complete Event
      milestonesRef.current[100] = true;
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'fds_audio_interaction',
          audio_action: 'complete',
          audio_id: productId,
          audio_title: title,
          audio_category: 'Hörbuch',
          audio_percent: 100,
          timestamp: new Date().toISOString()
        });
      }

      // Reset für nächsten Start
      milestonesRef.current = { 25: false, 50: false, 75: false, 100: false };
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playableUrl, chapters, productId, title]);

  // 4. Steuerungsfunktionen
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const targetSrc = playableUrl || audioUrl;
      if (!audio.src || audio.src !== targetSrc) {
        audio.src = targetSrc;
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if ((window as any).dataLayer) {
              (window as any).dataLayer.push({
                event: 'fds_audio_interaction',
                audio_action: 'play',
                audio_id: productId,
                audio_title: title,
                audio_category: 'Hörbuch',
                timestamp: new Date().toISOString()
              });
            }
          })
          .catch((err) => {
            console.warn('Playback fallback to direct audioUrl:', err);
            if (audioUrl && audio.src !== audioUrl) {
              audio.src = audioUrl;
              audio.play().then(() => setIsPlaying(true)).catch((e) => console.error('Fallback failed:', e));
            }
          });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasListenedDisclaimer) {
      setDisclaimerNotice('Du musst dir zuerst den rechtlichen Hinweis (1:19 Min.) einmalig anhören. Danach kannst du frei spulen.');
      setTimeout(() => setDisclaimerNotice(null), 4500);
      return;
    }
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    if (!hasListenedDisclaimer && seconds > 0) {
      setDisclaimerNotice('Vorspulen ist während des rechtlichen Hinweises (erste 1:19 Min.) gesperrt. Du musst ihn dir einmalig anhören.');
      setTimeout(() => setDisclaimerNotice(null), 4500);
      return;
    }
    const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const jumpToChapter = (chapter: AudiobookChapter) => {
    if (!hasListenedDisclaimer && chapter.id !== 'intro' && chapter.startTime >= DISCLAIMER_DURATION) {
      setDisclaimerNotice('Du musst dir zuerst den rechtlichen Hinweis (1:19 Min.) einmalig anhören. Danach kannst du in den Kapiteln hüpfen.');
      setTimeout(() => setDisclaimerNotice(null), 4500);
      return;
    }
    if (!audioRef.current) return;
    audioRef.current.currentTime = chapter.startTime;
    setCurrentTime(chapter.startTime);
    setActiveChapterId(chapter.id);
    if (!isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleResumePosition = () => {
    if (savedPosition && audioRef.current) {
      if (!hasListenedDisclaimer && savedPosition >= DISCLAIMER_DURATION) {
        setShowResumeBanner(false);
        return;
      }
      audioRef.current.currentTime = savedPosition;
      setCurrentTime(savedPosition);
      setShowResumeBanner(false);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const formatTime = (secs: number): string => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);

    const mStr = m < 10 ? `0${m}` : `${m}`;
    const sStr = s < 10 ? `0${s}` : `${s}`;

    if (h > 0) {
      return `${h}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        {/* Hidden HTML5 Audio Element – kein preload, kein Loop (stoppt nach einmaligem Hören) */}
        <audio
          ref={audioRef}
          src={playableUrl || audioUrl}
          controlsList="nodownload"
          preload="none"
          loop={false}
        />

        {/* Player Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between gap-3 bg-[var(--bg-alt)]/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
              <Sparkles size={16} />
              <span className="uppercase tracking-wider">Hörbuch Player</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
              aria-label="Player schließen"
            >
              <X size={20} />
            </button>
          </div>

          {/* Player Scrollable Content */}
          <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">

            {/* Resume Banner */}
            {showResumeBanner && savedPosition && (
              <div className="p-3.5 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/40 flex items-center justify-between gap-3 text-xs animate-fade-in">
                <div className="flex items-center gap-2 text-[var(--text-main)]">
                  <Bookmark size={16} className="text-[var(--accent)] shrink-0" />
                  <span>Letzte Position bei <strong>{formatTime(savedPosition)}</strong> fortsetzen?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResumePosition}
                    className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-xs hover:bg-[var(--accent-hover)] transition cursor-pointer"
                  >
                    Fortsetzen
                  </button>
                  <button
                    onClick={() => setShowResumeBanner(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Cover & Meta Display */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-lg border border-[var(--border)] shrink-0 relative group">
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex items-end gap-1 h-6">
                      <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:0ms] h-full" />
                      <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:150ms] h-3/4" />
                      <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:300ms] h-full" />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left space-y-2 flex-1">
                <span className="px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-semibold uppercase tracking-wider inline-block">
                  Hörbuch • {formatTime(duration)}
                </span>
                <h2 className="font-serif font-semibold text-xl sm:text-2xl text-[var(--text-main)] leading-snug">
                  {title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Autorin: <strong className="text-[var(--text-main)]">{author}</strong> • Sprecherin: <strong className="text-[var(--text-main)]">{reader}</strong>
                </p>

                {/* Offline-Speicher Button */}
                <div className="pt-2">
                  <OfflineDownloadButton
                    productId={productId}
                    audioUrl={audioUrl}
                    title={title}
                    variant="button"
                  />
                </div>
              </div>
            </div>

            {/* Timeline / Zeitstrahl Scrubber */}
            <div className="p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-3">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={hasListenedDisclaimer ? (duration || 100) : DISCLAIMER_DURATION}
                  step={0.5}
                  value={hasListenedDisclaimer ? currentTime : Math.min(currentTime, DISCLAIMER_DURATION)}
                  onChange={handleSeek}
                  disabled={!hasListenedDisclaimer}
                  className={`w-full h-2 rounded-lg appearance-none focus:outline-none ${
                    hasListenedDisclaimer 
                      ? 'bg-[var(--border)] cursor-pointer accent-[var(--accent)]' 
                      : 'bg-amber-500/20 cursor-not-allowed accent-amber-500 opacity-80'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-medium text-[var(--text-muted)]">
                <span>{formatTime(currentTime)}</span>
                {!hasListenedDisclaimer ? (
                  <span className="text-amber-600 dark:text-amber-400 font-sans text-[11px] font-semibold flex items-center gap-1">
                    <Lock size={12} />
                    <span>Rechtlicher Hinweis läuft (Spulen gesperrt bis 01:19)</span>
                  </span>
                ) : (
                  <span className="text-[var(--accent)] font-semibold">
                    -{formatTime(Math.max(0, duration - currentTime))}
                  </span>
                )}
              </div>

              {/* Einmaliger rechtlicher Hinweis bis 1:19 Min. */}
              {!hasListenedDisclaimer && (
                <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <Lock size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    <strong>Rechtlicher Hinweis:</strong> Bitte lausche der Einleitung einmalig bis 1:19 Min. Danach werden alle Kapitel und das Vor- &amp; Zurückspulen für dich freigeschaltet.
                  </span>
                </div>
              )}
            </div>

            {/* Warn-Hinweis wenn Nutzer während des Disclaimers vorspulen will */}
            <AnimatePresence>
              {disclaimerNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-sm"
                >
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">
                    <strong>Hinweis:</strong> {disclaimerNotice}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Playback Controls & Speed */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)]">
              {/* Speed Switcher */}
              <div className="flex items-center gap-1">
                {[0.8, 1.0, 1.2, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => changeSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold font-mono transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Main Play Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => skipSeconds(-15)}
                  className="p-2.5 rounded-full hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  title="15 Sekunden zurückspringen"
                >
                  <RotateCcw size={20} />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={isLoadingAudio}
                  className="w-14 h-14 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  aria-label={isPlaying ? 'Pause' : 'Wiedergabe starten'}
                >
                  {isLoadingAudio ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} className="ml-1" />
                  )}
                </button>

                <button
                  onClick={() => skipSeconds(15)}
                  className="p-2.5 rounded-full hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  title="15 Sekunden vorspringen"
                >
                  <RotateCw size={20} />
                </button>
              </div>

              {/* Mute Toggle */}
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                title={isMuted ? 'Ton einschalten' : 'Stummschalten'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Kapitel-Navigation (Kapitel-Schnellfinder) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <ListMusic size={15} className="text-[var(--accent)]" />
                  <span>Kapitel-Navigation ({chapters.length} Abschnitte)</span>
                </h4>
                <span className="text-[11px] text-[var(--text-muted)]">Klick zum Vor- &amp; Zurückspringen</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {chapters.map((ch) => {
                  const isActive = activeChapterId === ch.id;
                  const isLocked = !hasListenedDisclaimer && ch.id !== 'intro' && ch.startTime >= DISCLAIMER_DURATION;

                  return (
                    <button
                      key={ch.id}
                      onClick={() => jumpToChapter(ch)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--text-main)] shadow-xs cursor-pointer'
                          : isLocked
                          ? 'bg-[var(--bg-alt)]/50 border-[var(--border)] text-[var(--text-muted)] opacity-75 cursor-not-allowed hover:border-amber-400/50'
                          : 'bg-[var(--bg-alt)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40 cursor-pointer'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-xs block truncate">
                          {ch.title}
                        </span>
                        <span className="text-[11px] font-mono opacity-80 mt-0.5 block">
                          Startet ab {ch.formattedTime} {ch.duration ? `• Dauer: ${ch.duration}` : ''}
                        </span>
                      </div>

                      {isLocked ? (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold font-mono bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                          <Lock size={10} />
                          <span>Gesperrt</span>
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono ${
                          isActive ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] border border-[var(--border)]'
                        }`}>
                          {ch.formattedTime}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-alt)]/50 text-center">
            <p className="text-[11px] text-[var(--text-muted)]">
              🔒 Geschützt im internen App-Speicher hinterlegt • Keine freie MP3-Datei im Dateisystem
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
