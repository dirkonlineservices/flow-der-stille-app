import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const [url, setUrl] = useState('');
  const [titel, setTitel] = useState('');
  const [loading, setLoading] = useState(true);

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
          // Die fertige URL aus der Datenbank wird direkt als Quelle übergeben
          setUrl(prod.audio_path);
        }
      } catch (e: any) {
        console.error("Fehler beim Laden der Audio-URL:", e.message);
      } finally {
        setLoading(false);
      }
    }
    loadAudio();
  }, [produktId]);

  if (loading) return <span className="text-stone-400 text-xs">Lädt Audio-Spur...</span>;
  if (!url) return <span className="text-red-400 text-xs">Fehler: Audio-URL fehlt in Datenbank</span>;

  return (
    <div className="mt-8 p-4 sm:p-6 md:p-8 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl w-full shadow-sm">
      <h4 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-text-main)] mb-4">{titel}</h4>
      <audio 
        src={url} 
        controls 
        className="w-full" 
        preload="metadata" 
        controlsList="nodownload" 
      />
      <div className="text-xs text-[var(--color-text-muted)] mt-5 pt-3 border-t border-[var(--color-border-main)]">
        <strong>Audio-Hinweis:</strong> Instrumental und Stimmerzeugung erfolgen teilweise oder vollständig mit Unterstützung von KI.
      </div>
    </div>
  );
}
