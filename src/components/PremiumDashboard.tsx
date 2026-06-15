import React, { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Play, Pause } from 'lucide-react';
import SingleAudioPlayer from './SingleAudioPlayer';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PremiumShopDashboard({ session }: { session: any }) {
  const [produkte, setProdukte] = useState<any[]>([]);
  const [gekauftIds, setGekauftIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [gastEmail, setGastEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const user = session?.user;
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  // 2. Produktdaten und bestehende Käufe laden
  useEffect(() => {
    loadShopData();
  }, [user]);

  async function loadShopData() {
    try {
      const supabase = getSupabase();
      // Alle aktiven Produkte aus Supabase holen
      const { data: prodData, error: prodError } = await supabase.from('produkte').select('*');
      if (prodError) throw prodError;

      // Wenn der User eingeloggt ist, seine freigeschalteten Produkte prüfen
      let gekaufteSet: Set<string> = new Set();
      if (user) {
        const { data: kaufData, error: kaufError } = await supabase
          .from('kaeufe')
          .select('produkt_id')
          .eq('user_id', user.id);
        if (kaufError) throw kaufError;
        // @ts-ignore
        gekaufteSet = new Set(kaufData.map((k: any) => k.produkt_id));
      }
      
      setProdukte(prodData);
      setGekauftIds(gekaufteSet);
    } catch (error: any) {
      console.error("Fehler beim Laden des Dashboards:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Generiert die passende Audio-URL (Public für Kostenlos, Signed für Premium)
  const getAudioUrl = async (produkt: any) => {
    const supabase = getSupabase();
    if (parseFloat(produkt.preis) === 0) {
      const { data } = supabase.storage.from('audio-bucket').getPublicUrl(produkt.audio_path);
      return data.publicUrl;
    }
    const { data } = await supabase.storage.from('audio-bucket').createSignedUrl(produkt.audio_path, 3600);
    return data?.signedUrl;
  };

  // E-Mail Validierung für den Gast-Checkout
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    if (!email || !re.test(email)) {
      setEmailError('Bitte gib eine gültige E-Mail-Adresse für die Freischaltung an.');
      return false;
    }
    setEmailError('');
    return true;
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Premium-Bereich wird geladen...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-stone-50 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-serif text-stone-800">Übungen & Meditationen</h1>
        <p className="text-stone-600 mt-2 text-sm italic">Sanfte Bewegungen und Atemmuster, um deinem Körper Sicherheit zu signalisieren.</p>
      </header>

      {/* GAST-HINWEIS: Wenn nicht eingeloggt, zeigen wir das E-Mail-Feld zentral an */}
      {!user && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto">
          <h3 className="text-sm font-bold text-amber-900 mb-1">Als Gast bestellen / Einloggen</h3>
          <p className="text-xs text-amber-700 mb-3">Gib deine E-Mail ein, damit wir dir deine Zugangsdaten nach dem Kauf sofort zusenden können.</p>
          <input 
            type="email" 
            placeholder="deine-email@beispiel.de" 
            value={gastEmail}
            onChange={(e) => { setGastEmail(e.target.value); setEmailError(''); }}
            className="w-full p-2.5 text-sm rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {emailError && <p className="text-red-600 text-xs mt-1 font-semibold">{emailError}</p>}
        </div>
      )}

      <div className="space-y-6">
        {produkte.map((produkt: any) => {
          const istKostenlos = parseFloat(produkt.preis) === 0;
          const hatZugriff = gekauftIds.has(produkt.id) || istKostenlos;
          const isHeartOpening = produkt.id === 'ddd69d28-1378-4787-bb9a-bdaf0baca8ce';

          if (isHeartOpening && !user) {
            return (
              <div key={produkt.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
                <div className="flex-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-stone-100 text-stone-600 uppercase mb-2 inline-block">
                    {produkt.kategorie || 'Atemarbeit'}
                  </span>
                  <h2 className="text-xl font-bold text-stone-800">{produkt.titel}</h2>
                  <p className="text-stone-500 text-sm mt-1">{produkt.beschreibung}</p>
                </div>
                <div className="w-full md:w-auto text-center md:text-right text-sm text-stone-600 italic font-medium">
                  Kostenfrei nach Anmeldung
                </div>
              </div>
            );
          }

          return (
            <div key={produkt.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
              
              {/* Linke Seite: Produkt-Metadaten */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-stone-100 text-stone-600 uppercase">
                    {produkt.kategorie || 'Atemarbeit'}
                  </span>
                  {!istKostenlos && !hatZugriff && (
                    <span className="text-sm font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      {produkt.preis} €
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-stone-800">{produkt.titel}</h2>
                <p className="text-stone-500 text-sm mt-1 leading-relaxed">{produkt.beschreibung}</p>
              </div>

              {/* Rechte Seite: Dynamisches Interface (Player oder PayPal) */}
              <div className="w-full md:w-auto min-w-[200px] flex flex-col items-stretch md:items-end justify-center">
                {hatZugriff ? (
                  // ZUSTAND: FREIGESCHALTET (Kostenlos oder bereits gekauft)
                  <SingleAudioPlayer produktId={produkt.id} />
                ) : (
                  // ZUSTAND: KOSTENPFLICHTIG & NICHT GEKAUFT
                  <div className="w-full">
                    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "EUR" }}>
                      <PayPalCheckoutButton 
                        produkt={produkt} 
                        user={user} 
                        gastEmail={gastEmail} 
                        validateEmail={() => validateEmail(gastEmail)}
                        onSuccess={loadShopData} 
                      />
                    </PayPalScriptProvider>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

// SUB-KOMPONENTE: Der PayPal Smart Button mit Gast-Weiche
function PayPalCheckoutButton({ produkt, user, gastEmail, validateEmail, onSuccess }: { produkt: any, user: any, gastEmail: any, validateEmail: any, onSuccess: any }) {
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSdkReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id={`paypal-button-container-${produkt.id}`} key={`stable-paypal-key-${produkt.id}`} style={{ minHeight: "100px", width: "100%" }}>
      {isSdkReady ? (
        <PayPalButtons 
          forceReRender={[produkt.id]}
          style={{ layout: 'vertical', shape: 'pill', label: 'checkout', height: 40 }}
          
          onClick={(data, actions) => {
            // Wenn kein User eingeloggt ist, MUSS die Gast-E-Mail ausgefüllt sein
            if (!user && !validateEmail()) {
              return actions.reject();
            }
            return actions.resolve();
          }}

          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: produkt.preis.toString(), currency_code: "EUR" },
                description: produkt.titel
              }]
            });
          }}

          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              const supabase = getSupabase();
              let activeUserId = user?.id;

              // GAST-LOGIK: Wenn kein User eingeloggt ist, legen wir ein Profil in Supabase an
              if (!activeUserId) {
                // Wir rufen eine Supabase Edge Function oder ein sicheres Insert auf, 
                // um den Gast über seine Mail zu erfassen. Hier simulieren wir den DB-Eintrag:
                // Note: Assuming create_or_get_guest_user exists as per previous code rpc call
                const { data: gastUser, error: gastError } = await supabase.rpc('create_or_get_guest_user', {
                  email_param: gastEmail
                });
                
                if (gastError) {
                  console.error("Gast-Registrierungsfehler:", gastError.message);
                  alert("Zahlung erfolgreich, aber Registrierung fehlgeschlagen. Bitte Support kontaktieren.");
                  return;
                }
                activeUserId = gastUser;
              }

              // Kauf in der Tabelle registrieren
              await supabase.from('kaeufe').insert([{
                user_id: activeUserId,
                produkt_id: produkt.id,
                paypal_order_id: details.id,
                preis: parseFloat(details.purchase_units[0].amount.value),
                waehrung: 'EUR'
              }]);

              alert("Kauf erfolgreich! Die Meditation wurde sofort freigeschaltet.");
              onSuccess();
            }
          }}
          onError={(err: any) => {
            console.error("PayPal Render- oder Verarbeitungsfehler:", err);
          }}
        />
      ) : (
        <p className="text-xs text-stone-400">PayPal-Zahlungsmethode wird initialisiert...</p>
      )}
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
    if (!(window as any).paypal) return;
    // @ts-ignore
    (window as any).paypal.Buttons({
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
