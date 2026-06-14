import React, { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Play, Pause } from 'lucide-react';

export default function PremiumShopDashboard({ session }: { session: any }) {
  const [produkte, setProdukte] = useState<any[]>([]);
  const [gekauftIds, setGekauftIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [paypalReady, setPaypalReady] = useState(false);
  
  const user = session?.user;
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  // PayPal SDK laden
  useEffect(() => {
    // @ts-ignore
    if (window.paypal) { setPaypalReady(true); return; }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
    script.async = true;
    script.onload = () => setPaypalReady(true);
    document.body.appendChild(script);
  }, []);

  // Daten laden
  useEffect(() => {
    if (!user) return;
    loadShopData();
  }, [user]);

  async function loadShopData() {
    try {
      const supabase = getSupabase();
      const { data: prodData, error: prodError } = await supabase.from('produkte').select('*');
      if (prodError) throw prodError;

      const { data: kaufData, error: kaufError } = await supabase.from('kaeufe').select('produkt_id');
      if (kaufError) throw kaufError;

      const gekaufteSet = new Set(kaufData.map((k: any) => k.produkt_id));
      setProdukte(prodData);
      setGekauftIds(gekaufteSet);
    } catch (error: any) {
      console.error("Daten-Ladefehler:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Intelligente URL-Weiche: Kostenlos vs. Kauf-Inhalt
  const getAudioUrl = async (produkt: any) => {
    const supabase = getSupabase();
    // Wenn das Produkt 0 € kostet oder als 'kostenlos' deklariert ist, public streamen
    if (parseFloat(produkt.preis) === 0 || produkt.kategorie === 'kostenlos') {
      const { data } = supabase.storage.from('audio-bucket').getPublicUrl(produkt.audio_path);
      return data.publicUrl;
    }
    // Für Kauf-Inhalte: Sichere Signed URL generieren
    const { data } = await supabase.storage.from('audio-bucket').createSignedUrl(produkt.audio_path, 3600);
    return data?.signedUrl;
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Lädt Übungen...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {produkte.map((produkt) => {
          // Eine Übung ist freigeschaltet, wenn sie gekauft wurde ODER kostenlos ist (Preis = 0)
          const istKostenlos = parseFloat(produkt.preis) === 0;
          const hatZugriff = gekauftIds.has(produkt.id) || istKostenlos;

          return (
            <div key={produkt.id} className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-600 uppercase">
                    {produkt.kategorie}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {istKostenlos ? "Kostenlos" : `${produkt.preis} €`}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">{produkt.titel}</h2>
                <p className="text-gray-600 text-sm mb-4">{produkt.beschreibung}</p>
              </div>

              {hatZugriff ? (
                <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                  <AudioPlayerButton produkt={produkt} getUrl={getAudioUrl} />
                </div>
              ) : (
                <div className="mt-4">
                  {paypalReady ? (
                    <PayPalRenderButton produkt={produkt} onSuccess={loadShopData} />
                  ) : (
                    <div className="text-sm text-gray-400">PayPal lädt...</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sub-Komponente: Audio Player mit integriertem GTM-Tracking
function AudioPlayerButton({ produkt, getUrl }: { produkt: any, getUrl: any }) {
  const [url, setUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (!url) {
      const activeUrl = await getUrl(produkt);
      setUrl(activeUrl);
      // Wait for audio to load before playing
      audioRef.current.onloadeddata = () => {
        audioRef.current?.play();
        setIsPlaying(true);
      };
      
      // TRACKING: GA4 / GTM Event beim Klick auf Play
      // @ts-ignore
      if (window.dataLayer) {
        // @ts-ignore
        window.dataLayer.push({
          event: "audio_play",
          audio_title: produkt.titel,
          audio_category: produkt.kategorie,
          audio_type: parseFloat(produkt.preis) === 0 ? "kostenlos" : "premium"
        });
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={togglePlay}
        className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <audio 
        ref={audioRef} 
        src={url} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)}
        className="hidden" 
      />
      <div className="text-sm font-medium text-purple-900 truncate flex-1">
        {produkt.titel}
      </div>
    </div>
  );
}

// Sub-Komponente: PayPal Button
function PayPalRenderButton({ produkt, onSuccess }: { produkt: any, onSuccess: any }) {
  useEffect(() => {
    // @ts-ignore
    if (!window.paypal) return;
    // @ts-ignore
    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'pill', label: 'checkout' },
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: produkt.preis.toString(), currency_code: "EUR" },
            description: produkt.titel
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then(async (details: any) => {
          const supabase = getSupabase();
          await supabase.from('kaeufe').insert([{
            user_id: (await supabase.auth.getUser()).data.user?.id,
            produkt_id: produkt.id,
            paypal_order_id: details.id,
            preis: parseFloat(details.purchase_units[0].amount.value)
          }]);
          onSuccess();
        });
      }
    }).render(`#paypal-btn-${produkt.id}`);
  }, [produkt]);

  return <div id={`paypal-btn-${produkt.id}`}></div>;
}
