import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const [produkt, setProdukt] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fetchedUrl = useRef('');

  useEffect(() => {
    async function debugBuckets() {
      // Listet alle Buckets auf, die deine App aktuell in Supabase sehen kann
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error("Fehler beim Abrufen der Buckets:", error.message);
      } else if (buckets) {
        console.log("--- EXAKTE BUCKET-IDS IN DEINEM STORAGE: ---");
        buckets.forEach(b => console.log(`Bucket-Name: "${b.name}" | Interne ID für den Code: "${b.id}" | Öffentlich: ${b.public}`));
        console.log("--------------------------------------------");
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

    debugBuckets();
    fetchSingleProdukt();
  }, [produktId]);

  const togglePlayback = async () => {
    if (!produkt || !produkt.audio_path || !audioRef.current) return;

    try {
      if (!fetchedUrl.current) {
        // Wir versuchen es standardmäßig mit 'audio-bucket'
        const { data } = supabase.storage.from('audio-bucket').getPublicUrl(produkt.audio_path);
        
        if (!data || !data.publicUrl) {
          console.error("Öffentliche URL konnte nicht generiert werden.");
          return;
        }

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
