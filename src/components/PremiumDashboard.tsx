import React, { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Play, Pause, Search } from 'lucide-react';
import SingleAudioPlayer from './SingleAudioPlayer';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Link } from 'react-router-dom';
import UnlockBanner from './UnlockBanner';

export default function PremiumShopDashboard({ session }: { session: any }) {
  const [produkte, setProdukte] = useState<any[]>([]);
  const [gekauftIds, setGekauftIds] = useState<Set<string>>(new Set());
  const [kaufMap, setKaufMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Alle');
  const [sortBy, setSortBy] = useState('Standard');
  
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
      let kaufMap: Map<string, string> = new Map();

      if (user) {
        const { data: kaufData, error: kaufError } = await supabase
          .from('kaeufe')
          .select('produkt_id, created_at')
          .eq('user_id', user.id);
        if (kaufError) throw kaufError;
        // @ts-ignore
        gekaufteSet = new Set(kaufData.map((k: any) => k.produkt_id));
        // @ts-ignore
        kaufData.forEach(k => kaufMap.set(k.produkt_id, k.created_at));
      }
      
      setProdukte(prodData);
      setGekauftIds(gekaufteSet);
      setKaufMap(kaufMap);
    } catch (error: any) {
      console.error("Fehler beim Laden des Dashboards:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const baseCategories = ['Alle', 'Kostenfrei', 'Atemübung', 'Meditation', 'Kurz & Schnell', 'Selbsthypnose'];
  const categories = user ? [...baseCategories, 'Meine Käufe'] : baseCategories;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredProdukte = produkte.filter(prod => {
    const matchesSearch = prod.titel.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.beschreibung.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    const catLower = prod.kategorie?.toLowerCase() || '';
    const titleLower = prod.titel.toLowerCase();

    if (activeFilter === 'Kostenfrei') {
        matchesCategory = parseFloat(prod.preis) === 0;
    } else if (activeFilter === 'Atemübung') {
        matchesCategory = catLower.includes('atem') || titleLower.includes('atem') || titleLower.includes('muskelentspannung');
    } else if (activeFilter === 'Meditation') {
        matchesCategory = catLower.includes('meditation') || titleLower.includes('meditation') || titleLower.includes('herzöffnung') || titleLower.includes('loslassen');
    } else if (activeFilter === 'Selbsthypnose') {
       matchesCategory = catLower.includes('hypnose') || titleLower.includes('selbsthypnose') || titleLower.includes('hypnose');
    } else if (activeFilter === 'Kurz & Schnell') {
       matchesCategory = typeof prod.dauer === 'number' && prod.dauer >= 120 && prod.dauer <= 300;
    } else if (activeFilter === 'Meine Käufe') {
       matchesCategory = gekauftIds.has(prod.id);
    }
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
      if (sortBy === 'Neueste') {
          const dateA = new Date(a.created_at || '1970-01-01').getTime();
          const dateB = new Date(b.created_at || '1970-01-01').getTime();
          return dateB - dateA;
      } else if (sortBy === 'Älteste') {
          const dateA = new Date(a.created_at || '1970-01-01').getTime();
          const dateB = new Date(b.created_at || '1970-01-01').getTime();
          return dateA - dateB;
      } else if (sortBy === 'Teuerste') {
          return parseFloat(b.preis) - parseFloat(a.preis);
      } else if (sortBy === 'Günstigste') {
          return parseFloat(a.preis) - parseFloat(b.preis);
      }
      return 0;
  });

  if (loading) return <div className="p-10 text-center text-gray-500">Premium-Bereich wird geladen...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-stone-50 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-serif text-stone-800">Übungen & Meditationen</h1>
        <p className="text-stone-600 mt-2 text-sm italic">Sanfte Bewegungen und Atemmuster, um deinem Körper Sicherheit zu signalisieren.</p>
      </header>

      {/* QA Backdoor: Test Email */}
      <div className="mb-6 p-4 bg-stone-100 rounded-xl max-w-sm mx-auto">
        <input 
            type="email" 
            placeholder="QA-Test-E-Mail eingeben..." 
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 text-sm rounded border border-stone-300"
        />
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text"
            placeholder="Suche nach Meditation, Herzöffnung, Loslassen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === cat 
                  ? 'bg-stone-800 text-white' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto">
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-white text-stone-600 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none"
             >
               <option value="Standard">Standard Sortierung</option>
               <option value="Neueste">Neueste</option>
               <option value="Teuerste">Teuerste</option>
               <option value="Günstigste">Günstigste</option>
               <option value="Älteste">Älteste</option>
             </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {showUnlockBanner && <UnlockBanner />}
        {filteredProdukte.map((produkt: any) => {
          const istKostenlos = parseFloat(produkt.preis) === 0;
          const hatZugriff = gekauftIds.has(produkt.id) || istKostenlos;
          const isHeartOpening = produkt.id === 'ddd69d28-1378-4787-bb9a-bdaf0baca8ce';
          const isTestEmail = testEmail === 'tester@flow-der-stille.de';

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
                  {produkt.dauer && (
                    <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                      {formatDuration(produkt.dauer)} min
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-stone-800">{produkt.titel}</h2>
                <p className="text-stone-500 text-sm mt-1 leading-relaxed">{produkt.beschreibung}</p>
              </div>

              {/* Rechte Seite: Dynamisches Interface */}
              <div className="w-full md:w-auto min-w-[200px] flex flex-col items-stretch md:items-end justify-center">
                {hatZugriff ? (
                  // ZUSTAND: FREIGESCHALTET (Kostenlos oder bereits gekauft)
                  <SingleAudioPlayer produktId={produkt.id} />
                ) : !user ? (
                  // ZUSTAND: NICHT EINGELOGGT -> Registrieren/Login
                  <div className="text-center p-3 text-sm font-medium text-stone-700 bg-stone-100 rounded-xl">
                    Bitte <Link to="/login" className="text-[var(--color-accent-primary)] underline">einloggen</Link> oder <Link to="/register" className="text-[var(--color-accent-primary)] underline">registrieren</Link>, um zu kaufen.
                  </div>
                ) : isTestEmail ? (
                  <button 
                    onClick={async () => {
                        const supabase = getSupabase();
                        await supabase.from('kaeufe').insert([{
                          user_id: user.id,
                          produkt_id: produkt.id,
                          paypal_order_id: 'TEST_KAUF_' + Date.now(),
                          preis: parseFloat(produkt.preis),
                          waehrung: 'EUR'
                        }]);
                        alert("Kauf erfolgreich (Test-Modus)!");
                        setShowUnlockBanner(true);
                        setTimeout(() => {
                            loadShopData();
                            setShowUnlockBanner(false);
                        }, 2000); // 2-second delay
                    }}
                    className="w-full py-2 bg-stone-600 text-white rounded-xl text-sm font-bold hover:bg-stone-700 transition"
                  >
                    Kostenlos Freischalten (Test-Modus)
                  </button>
                ) : (
                  // ZUSTAND: KOSTENPFLICHTIG & NICHT GEKAUFT & EINGELOGGT
                  <div className="w-full">
                    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "EUR" }}>
                      <PayPalCheckoutButton 
                        produkt={produkt} 
                        user={user} 
                        setShowUnlockBanner={setShowUnlockBanner}
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

// SUB-KOMPONENTE: Der PayPal Smart Button
function PayPalCheckoutButton({ produkt, user, setShowUnlockBanner, onSuccess }: { produkt: any, user: any, setShowUnlockBanner: any, onSuccess: any }) {
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
          
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: produkt.preis.toString(), currency_code: "EUR" },
                description: produkt.titel
              }]
            });
          }}

          onApprove={async (data, actions) => {
            if (actions.order && user) {
              const details = await actions.order.capture();
              const supabase = getSupabase();

              // Kauf in der Tabelle registrieren
              await supabase.from('kaeufe').insert([{
                user_id: user.id,
                produkt_id: produkt.id,
                paypal_order_id: details.id,
                preis: parseFloat(details.purchase_units[0].amount.value),
                waehrung: 'EUR'
              }]);

              alert("Kauf erfolgreich! Die Meditation wird freigeschaltet...");
              setShowUnlockBanner(true);
              setTimeout(() => {
                onSuccess(); // Load fresh data, unlocking the UI
                setShowUnlockBanner(false);
              }, 2000); // 2-second delay
            } else {
              alert("Ein Fehler ist aufgetreten. Bitte stellen Sie sicher, dass Sie eingeloggt sind.");
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
