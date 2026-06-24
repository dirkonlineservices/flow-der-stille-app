import React, { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Play, Pause, Search } from 'lucide-react';

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

  // ⚡ UNZERSTÖRBARER PAYPAL-FALLBACK AUS DEINEM DASHBOARD
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "Abr2A6ISXpGoTN5xMfwAtTAKmgOr6Lj_H5znAiY8K8vLfpudiUcU9V7xfv32m_lVMSELyAoNe3i2s55-";

  useEffect(() => {
    loadShopData();
  }, [user]);

  async function loadShopData() {
    try {
      const supabase = getSupabase();
      const { data: prodData, error: prodError } = await supabase.from('produkte').select('*');
      if (prodError) throw prodError;

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
    <div className="max-w-4xl mx-auto p-6 font-sans bg-[var(--bg-main)] min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-serif text-[var(--text-main)]">Premium-Inhalte</h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm italic">Entdecke unsere exklusiven Premium-Inhalte: Meditation, Entspannungsübungen und Selbsthypnose, um dein Wohlbefinden zu stärken.</p>
      </header>

      {/* QA Backdoor: Test Email */}
      <div className="mb-6 p-4 bg-[var(--bg-card)] rounded-xl max-w-sm mx-auto border border-[var(--border)]">
        <input 
            type="email" 
            placeholder="QA-Test-E-Mail eingeben..." 
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 text-sm rounded border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-main)]"
        />
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Suche nach Meditation, Herzöffnung, Loslassen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === cat 
                  ? 'bg-[var(--accent)] text-white' 
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-alt)]'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto">
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-4 py-2 text-sm focus:outline-none"
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
              <div key={produkt.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
                <div className="flex-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-[var(--bg-alt)] text-[var(--text-muted)] uppercase mb-2 inline-block">
                    {produkt.kategorie || 'Atemarbeit'}
                  </span>
                  <h2 className="text-xl font-bold text-[var(--text-main)]">{produkt.titel}</h2>
                  <p className="text-[var(--text-muted)] text-sm mt-1">{produkt.beschreibung}</p>
                </div>
                <div className="w-full md:w-auto text-center md:text-right text-sm text-[var(--text-muted)] italic font-medium">
                  Kostenfrei nach Anmeldung
                </div>
              </div>
            );
          }

          return (
            <div key={produkt.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 flex flex-col transition hover:shadow-lg">
              
              <div className="flex flex-col md:flex-row items-stretch gap-8">
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg bg-[var(--bg-alt)] text-[var(--text-muted)] uppercase">
                        {produkt.kategorie || 'Atemarbeit'}
                    </span>
                    {produkt.dauer && (
                        <span className="text-xs font-medium text-[var(--text-muted)]">
                        {formatDuration(produkt.dauer)} min
                        </span>
                    )}
                    </div>
                    <h3 className="text-2xl font-semibold text-[var(--text-main)] mb-1">{produkt.titel}</h3>
                    {!hatZugriff && !istKostenlos && (
                        <div className="text-[1.35rem] font-bold text-[var(--text-main)] mb-3">
                            {produkt.preis} €
                        </div>
                    )}
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed">{produkt.beschreibung}</p>
                </div>

                {/* Checkout-Zone */}
                {!hatZugriff && (
                    <div className="md:w-[35%] border-t md:border-t-0 md:border-l border-[var(--border)]">
                        <div className="h-full w-full flex flex-col justify-center items-center p-6 md:p-8">
                            <div className="w-full max-w-[280px] flex flex-col gap-3">
                            {!user ? (
                                <div className="text-center p-4 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-alt)] rounded-xl">
                                Please <Link to="/login" className="text-[var(--accent)] underline">einloggen</Link> oder <Link to="/register" className="text-[var(--accent)] underline">registrieren</Link>, um zu kaufen.
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
                                className="w-full py-3 bg-[var(--accent)] text-white rounded-xl text-sm font-bold hover:bg-[var(--accent-hover)] transition"
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

              {/* 🎯 NEUER MOBILE-FIRST AUDIO-PLAYER */}
              {hatZugriff && (
                <div className="mt-8 pt-6 border-t border-[var(--border)]">
                    <AudioPlayerButton 
                      produkt={produkt} 
                      getUrl={async (p) => {
                        const supabase = getSupabase();
                        const { data } = await supabase.storage.from('audios').getPublicUrl(p.audio_url || `${p.id}.mp3`);
                        return data.publicUrl;
                      }} 
                    />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 🛡️ SUB-KOMPONENTE: PayPal Smart Button (Kollisions-Schutz integriert)
function PayPalCheckoutButton({ produkt, user, setShowUnlockBanner, onSuccess, paypalClientId }: { produkt: any, user: any, setShowUnlockBanner: any, onSuccess: any, paypalClientId: string }) {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [error, setError] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [missingIdError, setMissingIdError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
       (window as any).dataLayer.push({ event: 'begin_checkout' });
    }
    
    if (!paypalClientId || paypalClientId === 'undefined' || paypalClientId.trim() === '') {
      setMissingIdError(true);
      return;
    }

    if ((window as any).paypal) {
      setIsSdkReady(true);
      return;
    }

    // ⚡ FIX: Verhindert, dass das Skript 5x gleichzeitig geladen wird!
    if (document.getElementById('paypal-js-sdk')) {
      const checkInterval = setInterval(() => {
        if ((window as any).paypal) {
          clearInterval(checkInterval);
          setIsSdkReady(true);
        }
      }, 200);
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-js-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId.trim()}&currency=EUR&intent=capture`;
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    script.onerror = () => setError(true);
    document.body.appendChild(script);
  }, [paypalClientId]);

  useEffect(() => {
    if (isSdkReady && (window as any).paypal && acceptedTerms && !isRendering) {
      setIsRendering(true);
      const paypal = (window as any).paypal;
      const containerId = `#paypal-btn-${produkt.id}`;
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
        }
      }).render(containerId);
    }
  }, [isSdkReady, acceptedTerms, produkt, user, setShowUnlockBanner, onSuccess, isRendering]);

  if (missingIdError) return <p className="text-xs text-[#ef4444] font-medium p-2 bg-[var(--bg-alt)] rounded-lg">Zahlungsdienst temporär nicht verfügbar.</p>;
  if (error) return <p className="text-xs text-[#ef4444] font-medium p-2 bg-[var(--bg-alt)] rounded-lg">Zahlung konnte nicht geladen werden.</p>;
  if (!isSdkReady) return <p className="text-xs text-[var(--text-muted)] animate-pulse">PayPal wird geladen...</p>;

  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="flex items-start gap-2 text-[0.72rem] leading-[1.3] text-[var(--text-muted)] cursor-pointer">
          <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5" />
          <span className="leading-[1.3]">Ich stimme ausdrücklich zu, dass mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist begonnen wird.</span>
        </label>
      </div>
      <div className={`transition-opacity duration-200 ${acceptedTerms ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div id={`paypal-btn-${produkt.id}`}></div>
      </div>
    </div>
  );
}

// 🎯 SUB-KOMPONENTE: DAUMENFREUNDLICHER AUDIO-PLAYER (AUDIO-FREEZE BEHOBEN)
function AudioPlayerButton({ produkt, getUrl }: { produkt: any, getUrl: any }) {
  const [url, setUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: "audio_complete", audio_title: produkt.titel, audio_category: produkt.kategorie });
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [url, produkt.titel, produkt.kategorie]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // ⚡ FIX: URL asynchron laden und sofort in den Player zwingen
    if (!url) {
      const activeUrl = await getUrl(produkt);
      if (!activeUrl) {
          console.error("Keine gültige Audio-URL gefunden.");
          return;
      }
      setUrl(activeUrl);
      audio.src = activeUrl; 
      audio.load();
      
      audio.oncanplay = () => {
        audio.play().catch(err => console.error("Autoplay geblockt:", err));
        setIsPlaying(true);
        audio.oncanplay = null; // cleanup
      };
      
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: "audio_play", audio_title: produkt.titel, audio_category: produkt.kategorie });
      }
      return;
    }
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === "" || audio.src === window.location.href) {
        console.error("Keine gültige Audio-Quelle gesetzt.");
        return;
      }
      audio.play().catch(err => console.error("Playback Fehler:", err));
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] my-4 w-full max-w-sm mx-auto shadow-sm">
      <button 
        onClick={togglePlay}
        className={`w-20 h-20 flex items-center justify-center rounded-full shadow-md active:scale-95 transition-all text-white border-4 border-[var(--bg-card)] ${
          isPlaying 
            ? 'bg-[#ef4444] hover:bg-[#dc2626] hover:ring-4 hover:ring-red-200' 
            : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:ring-4 hover:ring-emerald-100'
        }`}
        aria-label={isPlaying ? "Pause" : "Abspielen"}
      >
        {isPlaying ? (
          <Pause size={32} fill="white" stroke="none" />
        ) : (
          <Play size={32} className="ml-1" fill="white" stroke="none" />
        )}
      </button>
      <div className="mt-4 text-center select-none">
        <div className="text-xl font-bold text-[var(--text-main)] tracking-wider">
          {formatTime(currentTime)} <span className="text-[var(--text-muted)] font-normal text-sm">/ {formatTime(duration || produkt.dauer || 0)}</span>
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-medium max-w-[240px] truncate">{produkt.titel}</div>
      </div>
      
      {/* ⚡ FIX: Das Audio-Element MUSS immer gerendert werden, auch ohne URL */}
      <audio ref={audioRef} src={url || undefined} className="hidden" preload="metadata" />
    </div>
  );
}