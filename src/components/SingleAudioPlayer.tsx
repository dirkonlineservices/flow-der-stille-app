import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';

export default function SingleAudioPlayer({ produktTitel }: { produktTitel: string }) {
  const [produkt, setProdukt] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSingleProdukt() {
      try {
        const supabase = getSupabase();
        // Holt genau das Produkt aus Supabase, dessen Titel wir übergeben
        const { data, error } = await supabase
          .from('produkte')
          .select('*')
          .eq('titel', produktTitel)
          .single();

        if (error) throw error;
        setProdukt(data);
      } catch (error: any) {
        console.error("Fehler beim Laden der Audio-Datei:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSingleProdukt();
  }, [produktTitel]);

  const togglePlayback = async () => {
    if (!produkt) return;

    if (!audioUrl) {
      const supabase = getSupabase();
      let url = '';
      if (parseFloat(produkt.preis) === 0) {
        const { data } = supabase.storage.from('audio-bucket').getPublicUrl(produkt.audio_path);
        url = data.publicUrl;
      } else {
        const { data } = await supabase.storage.from('audio-bucket').createSignedUrl(produkt.audio_path, 3600);
        url = data?.signedUrl || '';
      }
      setAudioUrl(url);

      setTimeout(() => {
        const audio = document.getElementById(`audio-single-${produkt.id}`) as HTMLAudioElement;
        if (audio) {
          audio.play();
          setIsPlaying(true);
        }
      }, 100);
      return;
    }

    const audio = document.getElementById(`audio-single-${produkt.id}`) as HTMLAudioElement;
    if (audio) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play();
          setIsPlaying(true);
        }
    }
  };

  if (loading) return <span className="text-xs text-stone-400">Audio lädt...</span>;
  if (!produkt) return <span className="text-xs text-red-400">Audio nicht gefunden</span>;

  return (
    <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-3 justify-between w-full max-w-md">
      <div className="flex-1">
        <h4 className="text-sm font-bold text-stone-800">{produkt.titel}</h4>
        <p className="text-[11px] text-stone-500 italic">Kostenlose Anwendung</p>
      </div>

      {/* Der runde, grüne/graue Playbutton passend zu deinem Design */}
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
        <audio 
            id={`audio-single-${produkt.id}`} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
            controlsList="nodownload" 
        />
      )}
    </div>
  );
}
