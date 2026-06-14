import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function SingleAudioPlayer({ produktId }) {
  const [produkt, setProdukt] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const fetchedUrl = useRef('');

  useEffect(() => {
    async function debugStorageFiles() {
      // Listet alle echten Dateinamen im Ordner "audio" in der Browser-Konsole auf
      const { data: files } = await supabase.storage.from('audio-bucket').list('audio');
      if (files) {
        console.log("--- ECHTE DATEINAMEN IM STORAGE-ORDNER 'audio': ---");
        files.forEach(f => console.log("Datei gefunden:", `audio/${f.name}`));
        console.log("--------------------------------------------------");
      }
    }
    
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
    
    debugStorageFiles();
    fetchSingleProdukt();
  }, [produktId]);

  const togglePlayback = async () => {
    if (!produkt || !produkt.audio_path || !audioRef.current) return;

    try {
      if (!fetchedUrl.current) {
        const { data } = supabase.storage.from('audio-bucket').getPublicUrl(produkt.audio_path);
        
        if (!data || !data.publicUrl) {
          console.error("Öffentliche URL konnte nicht generiert werden.");
          return;
        }

        console.log("Versuche abzuspielen von URL:", data.publicUrl);
        fetchedUrl.current = data.publicUrl;
        audioRef.current.src = data.publicUrl;
        audioRef.current.load();
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Wiedergabefehler im Browser:", err.message));
      }
    } catch (err: any) {
      console.error("Fehler im Ablauf:", err.message);
    }
  };

  if (loading) return <span className="text-xs text-stone-400">Lädt...</span>;
  if (!produkt) return <span className="text-xs text-red-400">Audio nicht gefunden</span>;

  return (
    <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-3 justify-between w-full max-w-md mt-2">
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
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
}

