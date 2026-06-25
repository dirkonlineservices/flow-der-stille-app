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
import { getSupabase } from '../lib/supabaseClient';

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const [url, setUrl] = useState('');
  const [titel, setTitel] = useState('');
  const [audioHinweis, setAudioHinweis] = useState('');
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function loadAudio() {
      if (!produktId) return;
      try {
        const supabase = getSupabase();
        const { data: prod, error: prodError } = await supabase
          .from('produkte')
          .select('*')
          .eq('id', produktId)
          .single();

        if (prodError) throw prodError;
        
        if (prod && prod.audio_path) {
          setTitel(prod.titel);
          setUrl(prod.audio_path);
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

  // ⚡ FIX: Multitasking-Sperre auch für diesen nativen Player
  const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach((el) => {
      if (el !== e.target) {
        el.pause();
      }
    });
  };

  if (loading) return <span className="text-stone-400 text-xs">Lädt Audio-Spur...</span>;
  if (!url) return <span className="text-red-400 text-xs">Fehler: Audio-URL fehlt in Datenbank</span>;

  return (
    <div className="mt-8 p-4 sm:p-6 md:p-8 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl w-full shadow-sm">
      <h4 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-text-main)] mb-4">{titel}</h4>
      
      {/* Nativer Browser-Player, aber mit globaler Pausen-Kontrolle (onPlay) */}
      <audio 
        ref={audioRef}
        src={url} 
        controls 
        className="w-full" 
        preload="metadata" 
        controlsList="nodownload"
        onPlay={handlePlay} 
      />
      
      {/* KI-Label dezent integriert */}
      {audioHinweis && (
        <p className="text-[10px] text-[var(--color-text-muted)] mt-5 pt-3 border-t border-[var(--color-border-main)] italic">
          {audioHinweis}
        </p>
      )}
    </div>
  );
}