import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const [produkt, setProdukt] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSingleProdukt() {
      if (!produktId) return;
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('produkte')
          .select('*')
          .eq('id', produktId)
          .single();

        if (error) throw error;
        setProdukt(data);
      } catch (error: any) {
        console.error("Fehler beim Laden des Audios:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSingleProdukt();
  }, [produktId]);

  const togglePlayback = async () => {
    if (!produkt || !produkt.audio_path) return;

    try {
      const supabase = getSupabase();
      if (!audioUrl) {
        let url = '';
        console.log("Versuche Audio zu laden von Pfad:", produkt.audio_path);
        
        // Always use signed URL for consistency in case the bucket is private
        const { data, error } = await supabase.storage.from('audio-bucket').createSignedUrl(produkt.audio_path, 3600);
        if (error) {
            console.error("Supabase Storage Error:", error);
            throw error;
        }
        url = data?.signedUrl || '';

        console.log("Generierte URL für Pfad:", url);
        
        if (!url) throw new Error("URL konnte nicht generiert werden.");
        setAudioUrl(url);

        // Debug: check if the URL is actually accessible
        fetch(url, { method: 'HEAD' })
            .then(res => console.log("URL HEAD request status:", res.status))
            .catch(err => console.error("URL HEAD request failed:", err));

        // Ensure the audio element is updated before playing
        setTimeout(() => {
          const audio = document.getElementById(`audio-single-${produkt.id}`) as HTMLAudioElement;
          if (audio) {
            console.log("Audio element src before setting:", audio.src);
            audio.src = url; // Explicitly set the src
            console.log("Audio element src after setting:", audio.src);
            audio.load(); 
            audio.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.error("Wiedergabefehler:", err.message));
          } else {
              console.error("Audio element not found in DOM!");
          }
        }, 500);
        return;
      }

      const audio = document.getElementById(`audio-single-${produkt.id}`) as HTMLAudioElement;
      if (audio) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Wiedergabefehler:", err.message));
        }
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

      {audioUrl && (
        <audio id={`audio-single-${produkt.id}`} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" controlsList="nodownload" />
      )}
    </div>
  );
}
