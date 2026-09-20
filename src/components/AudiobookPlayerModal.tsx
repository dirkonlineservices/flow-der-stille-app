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
import { useAuth } from '../context/AuthContext';
import QuickSocialUnlockBox from './QuickSocialUnlockBox';

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
  isOwned?: boolean;
  priceDisplay?: string;
  autoPlay?: boolean;
  onRequirePurchase?: (chapter?: AudiobookChapter) => void;
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
  initialStartTime,
  isOwned = false,
  priceDisplay = '4,99 €',
  autoPlay = true,
  onRequirePurchase
}: Props) {
  const { user } = useAuth();
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

  // 🎯 User-Wunsch: Erstes Kapitel bei Hörbüchern komplett freischalten!
  // Intro + Kapitel 1 sind gratis anhörbar (bis zum Beginn von Kapitel 2).
  const ch2 = chapters.find(c => c.id === 'ch2') || chapters[2];
  const maxFreeTime = isOwned 
    ? (durationSeconds || 3600) 
    : (ch2 ? ch2.startTime : 729);

  // Schutz-Mechanismus für den rechtlichen Hinweis (Disclaimer bis erstes echtes Kapitel z. B. 01:08 oder 01:19 Min.)
  const DISCLAIMER_DURATION = (chapters.length > 1 && chapters[1]?.startTime) ? chapters[1].startTime : 79;
  const DISCLAIMER_KEY = `fds_audiobook_disclaimer_listened_${productId}`;
  const [hasListenedDisclaimer, setHasListenedDisclaimer] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage?.getItem(DISCLAIMER_KEY) === 'true';
    } catch {
      return false;
    }
  });
  // Ref-Kopie für Event-Listener-Closures: verhindert stale closure auf Mobile (iOS)
  const isDisclaimerListenedRef = useRef<boolean>(
    typeof window !== 'undefined' && window.localStorage?.getItem(DISCLAIMER_KEY) === 'true'
  );
  const [disclaimerNotice, setDisclaimerNotice] = useState<string | null>(null);

  const PROGRESS_KEY = `fds_audiobook_progress_${productId}`;

  // Sicheres Speichern des Fortschritts mit Produkt-Alias Unterstützung
  const saveProgress = (time: number) => {
    if (!time || isNaN(time) || time < 5) return;
    try {
      const val = time.toString();
      localStorage.setItem(PROGRESS_KEY, val);
      if (productId.startsWith('fds_')) {
        localStorage.setItem(`fds_audiobook_progress_${productId.replace('fds_', '')}`, val);
      } else {
        localStorage.setItem(`fds_audiobook_progress_fds_${productId}`, val);
      }
    } catch (e) {
      console.warn('Could not save audiobook progress:', e);
    }
  };

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

    // Falls initialStartTime explizit mitgegeben wurde (z.B. Klick auf ein Kapitel) und Disclaimer gehört
    if (typeof initialStartTime === 'number' && initialStartTime > 0 && isDisclaimerListened) {
      setCurrentTime(initialStartTime);
      if (audioRef.current) {
        audioRef.current.currentTime = initialStartTime;
      }
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (initialStartTime >= chapters[i].startTime) {
          setActiveChapterId(chapters[i].id);
          break;
        }
      }
    } else {
      // Wenn der Disclaimer noch nicht gehört wurde: ZWINGEND bei 00:00 starten!
      if (!isDisclaimerListened) {
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        setActiveChapterId(chapters[0]?.id || 'intro');
      } else {
        // Gespeicherte Hörposition AUTOMATISCH übernehmen & fortsetzen!
        const saved = localStorage.getItem(PROGRESS_KEY) ||
                      (productId.startsWith('fds_')
                        ? localStorage.getItem(`fds_audiobook_progress_${productId.replace('fds_', '')}`)
                        : localStorage.getItem(`fds_audiobook_progress_fds_${productId}`));
        if (saved) {
          const pos = parseFloat(saved);
          if (!isNaN(pos) && pos > 5 && pos < durationSeconds - 15) {
            setSavedPosition(pos);
            setCurrentTime(pos);
            if (audioRef.current) {
              audioRef.current.currentTime = pos;
            }
            for (let i = chapters.length - 1; i >= 0; i--) {
              if (pos >= chapters[i].startTime) {
                setActiveChapterId(chapters[i].id);
                break;
              }
            }
            setShowResumeBanner(true);
          }
        }
      }
    }

    let playTimeout: any = null;
    if (autoPlay) {
      playTimeout = setTimeout(() => {
        if (audioRef.current) {
          const p = audioRef.current.play();
          if (p !== undefined) {
            p.then(() => setIsPlaying(true)).catch((e) => {
              console.warn('Autoplay wait:', e);
            });
          }
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      if (playTimeout) clearTimeout(playTimeout);
    };
  }, [isOpen, productId, audioUrl, initialStartTime, autoPlay]);

  // Automatisches Speichern bei Verlassen der Seite / App-Schließen
  useEffect(() => {
    const handleUnload = () => {
      if (audioRef.current && audioRef.current.currentTime > 5) {
        saveProgress(audioRef.current.currentTime);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [productId]);

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
        isDisclaimerListenedRef.current = true; // Ref sync halten für Event-Listener-Closures
        localStorage.setItem(DISCLAIMER_KEY, 'true');
      }

      // 🎯 Wenn nicht gekauft: Nach Ende von Kapitel 1 stoppen und Kaufhinweis anzeigen
      if (!isOwned && cur >= maxFreeTime) {
        audio.pause();
        audio.currentTime = maxFreeTime;
        setCurrentTime(maxFreeTime);
        setIsPlaying(false);
        setDisclaimerNotice('Kapitel 1 beendet. Schalte jetzt das vollständige Hörbuch frei, um nahtlos weiterzuhören.');
        if (onRequirePurchase) {
          onRequirePurchase(ch2);
        }
        return;
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

      // Fortschritt alle 2 Sekunden sichern
      if (cur > 5 && Math.floor(cur) % 2 === 0) {
        saveProgress(cur);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      // Falls der Browser currentTime beim Laden auf 0 zurücksetzt, gespeicherte Position garantieren:
      // Nutzt Ref statt Closure-Wert (isDisclaimerListened wäre stale auf iOS/Mobile!)
      const targetPos = (typeof initialStartTime === 'number' && initialStartTime > 0)
        ? initialStartTime
        : savedPosition;
      if (targetPos && targetPos > 5 && isDisclaimerListenedRef.current && audio.currentTime < 1) {
        audio.currentTime = targetPos;
        setCurrentTime(targetPos);
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
      saveProgress(audio.currentTime);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    // Ende des Hörbuchs: Garantierter Einmal-Durchlauf (kein Endlos-Loop)
    const handleEnded = () => {
      setIsPlaying(false);
      try {
        localStorage.removeItem(PROGRESS_KEY);
        if (productId.startsWith('fds_')) {
          localStorage.removeItem(`fds_audiobook_progress_${productId.replace('fds_', '')}`);
        } else {
          localStorage.removeItem(`fds_audiobook_progress_fds_${productId}`);
        }
      } catch {}
      setSavedPosition(null);
      setShowResumeBanner(false);

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

  // Polling-Fallback: Fortschrittsbalken & Zeitanzeige verlässlich synchronisieren.
  // Das timeupdate-Event allein kann bei preload="none" und dynamischem src-Wechsel unzuverlässig sein.
  // Dieser Interval liest currentTime direkt aus dem Audio-Element und aktualisiert den State.
  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Aktives Kapitel synchron mitführen
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (cur >= chapters[i].startTime) {
          setActiveChapterId(chapters[i].id);
          break;
        }
      }

      // 🎯 Wenn nicht gekauft: Nach Ende von Kapitel 1 stoppen
      if (!isOwned && cur >= maxFreeTime) {
        audio.pause();
        audio.currentTime = maxFreeTime;
        setCurrentTime(maxFreeTime);
        setIsPlaying(false);
        setDisclaimerNotice('Kapitel 1 beendet. Schalte jetzt das vollständige Hörbuch frei, um nahtlos weiterzuhören.');
        if (onRequirePurchase) {
          onRequirePurchase(ch2);
        }
        return;
      }

      // Disclaimer-Grenze prüfen
      if (cur >= DISCLAIMER_DURATION) {
        const alreadySet = localStorage.getItem(DISCLAIMER_KEY) === 'true';
        if (!alreadySet) {
          setHasListenedDisclaimer(true);
          localStorage.setItem(DISCLAIMER_KEY, 'true');
        }
      }

      // Fortschritt sichern (bei ganzen Vielfachen von 4 Sekunden)
      if (cur > 5 && Math.floor(cur) % 4 === 0) {
        saveProgress(cur);
      }
    }, 200); // 5× pro Sekunde – flüssig für einen Fortschrittsbalken

    return () => clearInterval(id);
  }, [isPlaying, chapters]);

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
      setDisclaimerNotice(`Du musst dir zuerst den rechtlichen Hinweis (${formatTime(DISCLAIMER_DURATION)} Min.) einmalig anhören. Danach kannst du frei spulen.`);
      setTimeout(() => setDisclaimerNotice(null), 4500);
      return;
    }
    const targetTime = parseFloat(e.target.value);
    if (!isOwned && targetTime >= maxFreeTime) {
      setCurrentTime(maxFreeTime);
      if (audioRef.current) audioRef.current.currentTime = maxFreeTime;
      if (onRequirePurchase) onRequirePurchase(ch2);
      return;
    }
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    if (!hasListenedDisclaimer && seconds > 0) {
      setDisclaimerNotice(`Vorspulen ist während des rechtlichen Hinweises (erste ${formatTime(DISCLAIMER_DURATION)} Min.) gesperrt. Du musst ihn dir einmalig anhören.`);
      setTimeout(() => setDisclaimerNotice(null), 4500);
      return;
    }
    const maxBound = !isOwned ? maxFreeTime : duration;
    const target = audioRef.current.currentTime + seconds;
    if (!isOwned && target >= maxFreeTime) {
      audioRef.current.currentTime = maxFreeTime;
      setCurrentTime(maxFreeTime);
      if (onRequirePurchase) onRequirePurchase(ch2);
      return;
    }
    const newTime = Math.min(Math.max(0, target), maxBound);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const jumpToChapter = (chapter: AudiobookChapter) => {
    if (!isOwned && chapter.id !== 'intro' && chapter.id !== 'ch1' && chapter.startTime >= maxFreeTime) {
      if (onRequirePurchase) {
        onRequirePurchase(chapter);
      } else {
        setDisclaimerNotice('Dieses Kapitel ist Teil der Vollversion. Bitte schalte das Hörbuch frei.');
        setTimeout(() => setDisclaimerNotice(null), 4500);
      }
      return;
    }

    if (!hasListenedDisclaimer && chapter.id !== 'intro' && chapter.startTime >= DISCLAIMER_DURATION) {
      setDisclaimerNotice(`Du musst dir zuerst den rechtlichen Hinweis (${formatTime(DISCLAIMER_DURATION)} Min.) einmalig anhören. Danach kannst du in den Kapiteln hüpfen.`);
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

  const handleClose = () => {
    if (audioRef.current && audioRef.current.currentTime > 5) {
      saveProgress(audioRef.current.currentTime);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        onClick={handleClose}
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
              onClick={handleClose}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
              aria-label="Player schließen"
            >
              <X size={20} />
            </button>
          </div>

          {/* Player Scrollable Content */}
          <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">

            {/* Kostenloses Kapitel 1 Banner mit 1-Klick-Hinweis & Registrierung für Nicht-Käufer */}
            {!isOwned && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex flex-col gap-3 text-xs shadow-xs animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <strong className="text-emerald-950 dark:text-emerald-100 font-bold block text-xs sm:text-sm">
                        Du hörst Kapitel 1 kostenlos ohne Anmeldung
                      </strong>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300/90 font-medium">
                        Genieße das gesamte 1. Kapitel gratis. Möchtest du alle weiteren Kapitel hören? Unten mit 1 Klick registrieren und für einmalig {priceDisplay} freischalten.
                      </span>
                    </div>
                  </div>
                  {onRequirePurchase && (
                    <button
                      type="button"
                      onClick={() => onRequirePurchase(ch2)}
                      className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-xs active:scale-95 transition-all whitespace-nowrap self-end sm:self-auto cursor-pointer"
                    >
                      Vollversion ({priceDisplay}) →
                    </button>
                  )}
                </div>

                {/* 1-Klick-Registrierung für Gäste */}
                {!user && (
                  <div className="pt-2 border-t border-emerald-300/40 dark:border-emerald-700/40">
                    <QuickSocialUnlockBox
                      produkt={{
                        id: productId,
                        titel: title,
                        preis: 4.99,
                        kategorie: 'Hörbuch'
                      }}
                      isAudiobook={true}
                      price={priceDisplay}
                      title="Gefällt dir Kapitel 1? Gesamtes Hörbuch freischalten"
                      subtitle={`Kapitel 1 läuft hier komplett kostenlos ohne Anmeldung. Wenn du danach alle weiteren Kapitel dauerhaft hören möchtest: Jetzt mit 1 Klick registrieren und für einmalig ${priceDisplay} (kein Abo) freischalten:`}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Resume Banner */}
            {showResumeBanner && savedPosition && (
              <div className="p-3.5 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in shadow-xs">
                <div className="flex items-center gap-2 text-[var(--text-main)] font-medium">
                  <Bookmark size={16} className="text-[var(--accent)] shrink-0" />
                  <span>Automatisch an letzter Position bei <strong>{formatTime(savedPosition)}</strong> fortgesetzt</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        setCurrentTime(0);
                        setActiveChapterId(chapters[0]?.id || 'intro');
                      }
                      setShowResumeBanner(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] font-semibold text-xs hover:bg-[var(--bg-alt)] transition cursor-pointer"
                  >
                    Von Beginn an hören (00:00)
                  </button>
                  <button
                    onClick={() => setShowResumeBanner(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
                    title="Hinweis schließen"
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

                {/* Offline-Speicher Button oder Freischalt-Hinweis */}
                <div className="pt-2">
                  {isOwned ? (
                    <OfflineDownloadButton
                      productId={productId}
                      audioUrl={audioUrl}
                      title={title}
                      variant="button"
                    />
                  ) : onRequirePurchase ? (
                    <button
                      type="button"
                      onClick={() => onRequirePurchase(ch2)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--accent)] transition cursor-pointer shadow-2xs"
                    >
                      <Lock size={12} />
                      <span>Vollversion freischalten ({priceDisplay})</span>
                    </button>
                  ) : null}
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
                <span className="text-stone-950 dark:text-stone-100 font-bold">{formatTime(currentTime)}</span>
                {!hasListenedDisclaimer ? (
                  <span className="text-stone-950 dark:text-amber-50 font-sans text-xs font-bold flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 shadow-2xs">
                    <Lock size={12} className="text-amber-900 dark:text-amber-300" />
                    <span>Rechtlicher Hinweis aktiv (Spulen gesperrt bis {formatTime(DISCLAIMER_DURATION)})</span>
                  </span>
                ) : (
                  <span className="text-[var(--accent)] font-semibold font-mono">
                    -{formatTime(Math.max(0, duration - currentTime))}
                  </span>
                )}
              </div>

              {/* Einmaliger rechtlicher Hinweis – kontrastreich & gut lesbar */}
              {!hasListenedDisclaimer && (
                <div className="text-xs bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/70 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-200/80 dark:bg-amber-900/70 flex items-center justify-center shrink-0 text-amber-950 dark:text-amber-200 mt-0.5 shadow-2xs">
                    <Lock size={15} />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-stone-950 dark:text-white font-bold block text-xs sm:text-sm">
                      Rechtlicher Hinweis erforderlich
                    </strong>
                    <span className="text-xs text-stone-800 dark:text-amber-100 font-medium block leading-relaxed">
                      Bitte lausche der Einleitung einmalig bis {formatTime(DISCLAIMER_DURATION)} Min. Danach werden alle Kapitel und das freie Vor- &amp; Zurückspulen automatisch für dich freigeschaltet.
                    </span>
                  </div>
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
                  className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-700/60 text-stone-950 dark:text-amber-50 text-xs flex items-start gap-2.5 shadow-sm"
                >
                  <AlertCircle size={16} className="text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed text-stone-800 dark:text-amber-100 font-medium">
                    <strong className="text-stone-950 dark:text-amber-50 font-bold">Hinweis:</strong> {disclaimerNotice}
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
                <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
                  <ListMusic size={15} className="text-[var(--accent)]" />
                  <span>Kapitel-Navigation ({chapters.length} Abschnitte)</span>
                </h4>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Klick zum Vor- &amp; Zurückspringen</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {chapters.map((ch) => {
                  const isActive = activeChapterId === ch.id;
                  const isLockedByPurchase = !isOwned && ch.id !== 'intro' && ch.id !== 'ch1' && ch.startTime >= maxFreeTime;
                  const isLockedByDisclaimer = isOwned && !hasListenedDisclaimer && ch.id !== 'intro' && ch.startTime >= DISCLAIMER_DURATION;
                  const isLocked = isLockedByPurchase || isLockedByDisclaimer;

                  return (
                    <button
                      key={ch.id}
                      onClick={() => jumpToChapter(ch)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent)]/15 border-2 border-[var(--accent)] text-[var(--text-main)] shadow-sm'
                          : isLocked
                          ? 'bg-[var(--bg-alt)]/60 border-[var(--border)] text-[var(--text-muted)] opacity-85 hover:border-amber-400/50'
                          : 'bg-[var(--bg-alt)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className={`font-semibold text-xs block truncate ${isActive ? 'text-[var(--text-main)] font-bold' : ''}`}>
                          {ch.title}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5 block">
                          Startet ab {ch.formattedTime} {ch.duration ? `• Dauer: ${ch.duration}` : ''}
                        </span>
                      </div>

                      {isLocked ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-amber-100 dark:bg-amber-900/60 text-stone-950 dark:text-amber-100 border border-amber-300 dark:border-amber-700/60 flex items-center gap-1 shadow-2xs shrink-0">
                          <Lock size={10} className="text-amber-900 dark:text-amber-300" />
                          <span>{isLockedByPurchase ? 'Vollversion' : 'Gesperrt'}</span>
                        </span>
                      ) : !isOwned && (ch.id === 'intro' || ch.id === 'ch1') ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 shrink-0">
                          Gratis
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono shrink-0 transition-all ${
                          isActive
                            ? 'bg-[var(--accent)] text-white shadow-xs flex items-center gap-1.5'
                            : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)]'
                        }`}>
                          {isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>{formatTime(currentTime)}</span>
                            </>
                          ) : (
                            ch.formattedTime
                          )}
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
            <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
              🔒 Geschützt im internen App-Speicher hinterlegt • Keine freie MP3-Datei im Dateisystem
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
