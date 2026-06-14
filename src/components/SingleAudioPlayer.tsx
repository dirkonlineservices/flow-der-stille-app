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
    <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl w-full max-w-md shadow-sm">
      <h4 className="text-sm font-bold text-stone-800 mb-2">{titel}</h4>
      <audio 
        src={url} 
        controls 
        className="w-full text-stone-800" 
        preload="metadata" 
        controlsList="nodownload" 
      />
      <div className="text-[10px] text-stone-400 mt-3 pt-2 border-t border-stone-200">
        <strong>Audio-Hinweis:</strong> Instrumental und Stimmerzeugung erfolgen teilweise mit Unterstützung von KI.
      </div>
    </div>
  );
}
