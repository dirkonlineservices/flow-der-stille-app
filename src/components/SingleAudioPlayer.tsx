/* =========================================================================================
Hinweis: Kritische Audio-Logik.
1. Native DOM-Event Listeners (play/pause) für globalen Multitasking-Schutz.
2. Dynamisches Laden des Labels (audio_hinweis) aus Supabase.
3. Geschütztes Streaming: Die Quelle wird erst beim Klick auf Play per
   useProtectedStream (Offline-Speicher oder Audio-Worker mit Kurzzeit-Link) gesetzt. Kein audio_path.
=========================================================================================
*/

import React, { useEffect, useState, useRef } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';
import DisclaimerModal from './DisclaimerModal';
import { useProtectedStream } from '../hooks/useProtectedStream';
import { OfflineDownloadButton } from './OfflineDownloadButton';
import { PRODUKT_COLUMNS } from '../lib/offlineProductsService';

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const [produkt, setProdukt] = useState<any>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [titel, setTitel] = useState('');
  const [audioHinweis, setAudioHinweis] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const stream = useProtectedStream(produkt);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  useEffect(() => {
    async function loadAudio() {
      if (!produktId) return;
      try {
        const supabase = getSupabase();
        const { data: prod, error: prodError } = await supabase
          .from('produkte')
          .select(PRODUKT_COLUMNS)
          .eq('id', produktId)
          .single();

        if (prodError) throw prodError;
        
        if (prod) {
          setProdukt(prod);
          setTitel(prod.titel);
          setAudioHinweis(prod.audio_hinweis || '');
        }
      } catch (e: any) {
        console.error("Fehler beim Laden der Audio-URL:", e.message);
      } finally {
        setLoading(false);
      }
    }
    loadAudio();
  }, [produktId]);

  // Erster Start: Login und Haftungshinweis prüfen, dann Kurzzeit-Link holen
  const startStream = async () => {
    const accepted = localStorage.getItem('flow_disclaimer_accepted') === 'true';
    if (!accepted) {
      setShowDisclaimer(true);
      return;
    }
    const started = await stream.play(audioRef.current);
    if (started) setStreamReady(true);
  };

  // Native Steuerung: abgelaufenen Link nach langer Pause automatisch erneuern
  const handleNativePlay = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget;
    handlePlay(e);
    if (!audio.paused) stream.play(audio);
  };

  // ⚡ FIX: Multitasking-Sperre auch für diesen nativen Player
  const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const accepted = localStorage.getItem('flow_disclaimer_accepted') === 'true';
    if (!accepted) {
      e.currentTarget.pause();
      setShowDisclaimer(true);
      return;
    }

    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach((el) => {
      if (el !== e.target) {
        el.pause();
      }
    });
  };

  if (loading) return <span className="text-stone-400 text-xs">Lädt Audio-Spur...</span>;
  if (!produkt) return <span className="text-red-800 text-xs">Audio gerade nicht verfügbar</span>;

  return (
    <>
      <div className="mt-8 p-4 sm:p-6 md:p-8 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl w-full shadow-sm">
        <h4 className="text-sm sm:text-base md:text-lg font-bold text-[var(--text-main)] mb-4">{titel}</h4>
        
        {!streamReady && (
          <button
            onClick={startStream}
            disabled={stream.isFetchingLink}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#344034] text-white font-semibold shadow-sm hover:bg-[#2a342a] transition-all disabled:opacity-70"
          >
            {stream.isFetchingLink ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="white" stroke="none" />}
            <span>{stream.isFetchingLink ? 'Audio wird geladen …' : 'Audio abspielen'}</span>
          </button>
        )}

        {/* Nativer Browser-Player, aber mit globaler Pausen-Kontrolle (onPlay). Quelle erst nach Klick. */}
        <audio 
          ref={audioRef}
          controls={streamReady}
          className={streamReady ? 'w-full' : 'hidden'}
          preload="none" 
          controlsList="nodownload noplaybackrate"
          onContextMenu={(e) => e.preventDefault()}
          onPlay={handleNativePlay}
          onError={stream.onAudioError}
          onTimeUpdate={(e) => { handleTimeUpdate(); stream.onAudioTimeUpdate(e); }}
          onLoadedMetadata={handleLoadedMetadata}
        />
        
        {/* Zeit-Anzeige */}
        <div className="text-sm text-[var(--color-text-muted)] mt-2 font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Schalter für Offline-Verfügbarkeit im Flugmodus */}
        <OfflineDownloadButton
          productId={produktId}
          title={titel}
          variant="button"
        />

        {/* KI-Label dezent integriert */}
        {audioHinweis && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-5 pt-3 border-t border-[var(--color-border-main)] italic">
            {audioHinweis}
          </p>
        )}
      </div>

      <DisclaimerModal 
        isOpen={showDisclaimer} 
        onAccepted={() => {
          setShowDisclaimer(false);
          startStream();
        }} 
      />

      {stream.modals}
    </>
  );
}