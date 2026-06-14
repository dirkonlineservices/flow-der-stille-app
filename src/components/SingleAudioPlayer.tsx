import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const [produkt, setProdukt] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('Anwendung starten');
  const audioRef = useRef<HTMLAudioElement>(null);
  const localUrlRef = useRef('');

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

    // Speicherbereinigung, wenn die Komponente entladen wird
    return () => {
      if (localUrlRef.current) {
        URL.revokeObjectURL(localUrlRef.current);
      }
    };
  }, [produktId]);

  const togglePlayback = async () => {
    if (!produkt || !produkt.audio_path || !audioRef.current) return;

    try {
      // Falls die Datei noch nicht im Browser-Speicher liegt, laden wir sie jetzt direkt herunter
      if (!localUrlRef.current) {
        setStatusText('Verbindung wird aufgebaut...');
        
        const { data, error } = await supabase.storage
          .from('audio-bucket')
          .download(produkt.audio_path);

        if (error) {
          console.error("Supabase-Download-Fehler:", error.message);
          setStatusText('Ladefehler - Datei fehlt im Storage');
          return;
        }

        // Wir erzeugen eine lokale, virtuelle Browser-URL aus den reinen Audio-Daten
        const objectUrl = URL.createObjectURL(data);
        localUrlRef.current = objectUrl;
        
        audioRef.current.src = objectUrl;
        audioRef.current.load();
        setStatusText('');
      }

      // Steuerung der Wiedergabe
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error("Browser-Wiedergabefehler:", err.message);
            setStatusText('Fehler beim Abspielen');
          });
      }
    } catch (err: any) {
      console.error("Kritischer Fehler im Ablauf:", err.message);
      setStatusText('Fehler');
    }
  };

  if (loading) return <span className="text-xs text-stone-400">Lädt...</span>;
  if (!produkt) return <span className="text-xs text-red-400">Audio nicht gefunden</span>;

  return (
    <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-3 justify-between w-full max-w-md mt-2 shadow-sm">
      <div className="flex-1">
        <h4 className="text-sm font-bold text-stone-800">{produkt.titel}</h4>
        <p className="text-[11px] text-stone-500 italic">
          {statusText ? statusText : "Bereit zum Abspielen"}
        </p>
      </div>
      <button 
        onClick={togglePlayback}
        className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all shadow ${isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-600 hover:bg-stone-700'}`}
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
