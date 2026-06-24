import React, { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Play, Pause, Search } from 'lucide-react';
import SingleAudioPlayer from './SingleAudioPlayer';

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

  const baseCategories = ['Alle', 'Kostenfrei', 'Meditation', 'Entspannungsübungen', 'Selbsthypnose'];
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
    } else if (activeFilter === 'Meditation') {
        matchesCategory = catLower.includes('meditation') || titleLower.includes('meditation') || titleLower.includes('herzöffnung') || titleLower.includes('loslassen');
    } else if (activeFilter === 'Entspannungsübungen') {
        matchesCategory = catLower.includes('entspannung') || titleLower.includes('entspannung') || titleLower.includes('muskelentspannung');
    } else if (activeFilter === 'Selbsthypnose') {
       matchesCategory = catLower.includes('selbsthypnose') || titleLower.includes('selbsthypnose');
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
    <div className="max-w-4xl mx-auto p-6 font-sans bg-[var(--color-bg-body)] min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-serif text-[var(--color-text-main)]">Premium-Inhalte</h1>
        <p className="text-[var(--color-text-muted)] mt-2 text-sm italic">Entdecke unsere exklusiven Premium-Inhalte: Meditation, Entspannungsübungen und Selbsthypnose, um dein Wohlbefinden zu stärken.</p>
      </header>

      {/* QA Backdoor: Test Email */}
      <div className="mb-6 p-4 bg-[var(--color-bg-card)] rounded-xl max-w-sm mx-auto border border-[var(--color-border-main)]">
        <input 
            type="email" 
            placeholder="QA-Test-E-Mail eingeben..." 
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 text-sm rounded border border-[var(--color-border-main)] bg-[var(--color-bg-body)] text-[var(--color-text-main)]"
        />
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Suche nach Meditation, Herzöffnung, Loslassen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === cat 
                  ? 'bg-[var(--color-accent-primary)] text-white' 
                  : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-main)] hover:bg-[var(--color-bg-alt)]'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto">
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-main)] rounded-full px-4 py-2 text-sm focus:outline-none"
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
          const isTestEmail = testEmail.toLowerCase() === 'tester@flow-der-stille.de';

          if (isHeartOpening && !user) {
            return (
              <div key={produkt.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
                <div className="flex-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] uppercase mb-2 inline-block">
                    {produkt.kategorie || 'Atemarbeit'}
                  </span>
                  <h2 className="text-xl font-bold text-[var(--color-text-main)]">{produkt.titel}</h2>
                  <p className="text-[var(--color-text-muted)] text-sm mt-1">{produkt.beschreibung}</p>
                </div>
                <div className="w-full md:w-auto text-center md:text-right text-sm text-[var(--color-text-muted)] italic font-medium">
                  Kostenfrei nach Anmeldung
                </div>
              </div>
            );
          }

          return (
            <div key={produkt.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl p-8 flex flex-col transition hover:shadow-lg">
              
              <div className="flex flex-col md:flex-row items-stretch gap-8">
                {/* Linke Spalte: Produkt-Informationen (60%) */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] uppercase">
                        {produkt.kategorie || 'Atemarbeit'}
                    </span>
                    {produkt.dauer && (
                        <span className="text-xs font-medium text-[var(--color-text-muted)]">
                        {formatDuration(produkt.dauer)} min
                        </span>
                    )}
                    </div>
                    <h3 className="text-2xl font-semibold text-[var(--color-text-main)] mb-1">{produkt.titel}</h3>
                    {!hatZugriff && !istKostenlos && (
                        <div className="text-[1.35rem] font-bold text-[var(--color-text-main)] mb-3">
                            {produkt.preis} €
                        </div>
                    )}
                    <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{produkt.beschreibung}</p>
                    {produkt.highlights && Array.isArray(produkt.highlights) && (
                    <ul className="space-y-2 mt-4 ml-1">
                        {produkt.highlights.map((highlight: string, index: number) => (
                        <li key={index} className="flex items-start text-[0.9rem] text-[var(--color-text-main)] leading-tight">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-1.5 mr-3 flex-shrink-0" />
                            {highlight}
                        </li>
                        ))}
                    </ul>
                    )}
                </div>

                {/* Checkout-Zone (Nur wenn noch nicht gekauft) */}
                {!hatZugriff && (
                    <div className="md:w-[35%] border-t md:border-t-0 md:border-l border-[var(--color-border-main)]">
                        <div className="h-full w-full flex flex-col justify-center items-center p-6 md:p-8">
                            <div className="w-full max-w-[280px] flex flex-col gap-3">
                            {!user ? (
                                <div className="text-center p-4 text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] rounded-xl">
                                Please <Link to="/login" className="text-[var(--color-accent-primary)] underline">einloggen</Link> oder <Link to="/register" className="text-[var(--color-accent-primary)] underline">registrieren</Link>, um zu kaufen.
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
                                    }, 2000); 
                                }}
                                className="w-full py-3 bg-[var(--color-accent-primary)] text-white rounded-xl text-sm font-bold hover:bg-[var(--color-accent-hover)] transition"
                                >
                                Kostenlos Freischalten (Test-Modus)
                                </button>
                            ) : (
                                <PayPalCheckoutButton 
                                produkt={produkt} 
                                user={user} 
                                setShowUnlockBanner={setShowUnlockBanner}
                                onSuccess={loadShopData} 
                                paypalClientId={PAYPAL_CLIENT_ID}
                                />
                            )}
                            </div>
                        </div>
                    </div>
                )}
              </div>

              {/* Audio-Zone (Nur wenn Zugriff besteht) */}
              {hatZugriff && (
                <div className="mt-8 pt-6 border-t border-[var(--color-border-main)]">
                    <SingleAudioPlayer produktId={produkt.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SUB-KOMPONENTE: Der PayPal Smart Button (ROBUST & MANUELL)
function PayPalCheckoutButton({ produkt, user, setShowUnlockBanner, onSuccess, paypalClientId }: { produkt: any, user: any, setShowUnlockBanner: any, onSuccess: any, paypalClientId: string }) {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [error, setError] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    // 1. GTM Tracking: begin_checkout
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
       (window as any).dataLayer.push({ event: 'begin_checkout' });
    }
    
    // 2. Load SDK Manually
    if ((window as any).paypal) {
      setIsSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR&intent=capture`;
    script.async = true;
    
    script.onload = () => {
      setIsSdkReady(true);
    };
    
    script.onerror = () => {
      setError(true);
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'checkout_error', error_type: 'paypal_sdk_load_failed' });
      }
    };
    
    document.body.appendChild(script);
  }, [paypalClientId]);

  useEffect(() => {
    // 3. Render Buttons Guard
    if (isSdkReady && (window as any).paypal && acceptedTerms && !isRendering) {
      setIsRendering(true);
      const paypal = (window as any).paypal;
      
      const containerId = `#paypal-btn-${produkt.id}`;
      // Clean up previous button if exists
      const container = document.querySelector(containerId);
      if (container) container.innerHTML = '';
      
      paypal.Buttons({
        style: { layout: 'vertical', shape: 'pill', label: 'checkout', height: 40 },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [{
              amount: { value: produkt.preis.toString(), currency_code: "EUR" },
              description: produkt.titel
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          if (actions.order && user) {
            const details = await actions.order.capture();
            const supabase = getSupabase();
            await supabase.from('kaeufe').insert([{
              user_id: user.id,
              produkt_id: produkt.id,
              paypal_order_id: details.id,
              preis: parseFloat(details.purchase_units[0].amount.value),
              waehrung: 'EUR',
              widerruf_verzicht_akzeptiert: true
            }]);
            setShowUnlockBanner(true);
            setTimeout(() => {
              onSuccess();
              setShowUnlockBanner(false);
            }, 2000);
          }
        },
        onError: (err: any) => {
          console.error("PayPal Render- oder Verarbeitungsfehler:", err);
        }
      }).render(containerId);
    }
  }, [isSdkReady, acceptedTerms, produkt, user, setShowUnlockBanner, onSuccess, isRendering]);

  if (error) return <p className="text-xs text-[#ef4444]">Zahlung konnte nicht geladen werden.</p>;
  if (!isSdkReady) return <p className="text-xs text-[var(--color-text-muted)]">PayPal wird geladen...</p>;

  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="flex items-start gap-2 text-[0.72rem] leading-[1.3] text-[var(--color-text-muted)] cursor-pointer">
          <input 
              type="checkbox" 
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5"
          />
          <span className="leading-[1.3]">Ich stimme ausdrücklich zu, dass mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist begonnen wird. Das Recht auf Tonaufnahmen/Audios im Streaming wird sofort bereitgestellt.</span>
        </label>
      </div>
      
      <div className={`transition-opacity duration-200 ${acceptedTerms ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div id={`paypal-btn-${produkt.id}`}></div>
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


