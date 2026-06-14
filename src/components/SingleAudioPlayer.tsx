import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const [produkt, setProdukt] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fetchedUrl = useRef(''); // Speichert die URL stabil außerhalb des States

  useEffect(() => {
    async function fetchSingleProdukt() {
      if (!produktId) return;
      try {
        const { data, error } = await supabase
          .from('produkte')
          .select('*')
          .eq('id', produktId)
          .single();

        if (error) throw error;
        setProdukt(data);
      } catch (error: any) {
        console.error("Fehler beim Laden des Produkts:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSingleProdukt();
  }, [produktId]);

  const togglePlayback = async () => {
    if (!produkt || !produkt.audio_path || !audioRef.current) return;

    try {
      // Wenn noch keine URL geladen wurde, holen wir sie jetzt
      if (!fetchedUrl.current) {
        let url = '';
        
        if (parseFloat(produkt.preis) === 0) {
          const { data } = supabase.storage.from('audio-bucket').getPublicUrl(produkt.audio_path);
          url = data.publicUrl;
        } else {
          const { data } = await supabase.storage.from('audio-bucket').createSignedUrl(produkt.audio_path, 3600);
          url = data?.signedUrl || '';
        }

        if (!url) {
          console.error("Keine gültige URL von Supabase erhalten.");
          return;
        }

        fetchedUrl.current = url;
        audioRef.current.src = url; // Direkt ins DOM-Element schreiben
        audioRef.current.load();    // Dem Browser sagen: Datei frisch einlesen
      }

      // Wiedergabe-Status umschalten
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // play() gibt ein Promise zurück, das fangen wir sauber ab
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Browser-Wiedergabefehler:", err.message));
      }
    } catch (err: any) {
      console.error("Fehler im Player-Ablauf:", err.message);
    }
  };

  if (loading) return <span className="text-xs text-stone-400">Lädt...</span>;
  if (!produkt) return <span className="text-xs text-red-400">Audio nicht gefunden</span>;

  return (
    <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-3 justify-between w-full max-w-md">
      <div className="flex-1">
        <h4 className="text-sm font-bold text-stone-800">{produkt.titel}</h4>
        <p className="text-[11px] text-stone-500 italic">Anwendung starten</p>
      </div>

      <button 
        onClick={togglePlayback}
        className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${isPlaying ? 'bg-amber-600' : 'bg-stone-600 hover:bg-stone-700'}`}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-4 h-4 fill-white translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      {/* Unsichtbarer, stabiler HTML5 Player über useRef verknüpft */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
        controlsList="nodownload" 
      />
    </div>
  );
}
