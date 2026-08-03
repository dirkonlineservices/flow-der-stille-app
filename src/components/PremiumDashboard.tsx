import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Search, CreditCard, Loader2 } from 'lucide-react';
import { AudioPlayerButton } from './AudioPlayerButton';
import { PayPalCheckoutButton } from './PayPalCheckoutButton';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UnlockBanner from './UnlockBanner';
import { BillingService } from '../lib/billing';

export default function PremiumShopDashboard() {
  const { user } = useAuth();
  const [produkte, setProdukte] = useState<any[]>([]);
  const [gekauftIds, setGekauftIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Alle');
  const [sortBy, setSortBy] = useState('Standard');
  
  const [isVip, setIsVip] = useState(false);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  const isNativeApp = BillingService.isNative();
  const HEART_OPENING_ID = 'atemarbeit_herzoeffnung';
  
  // Zieht den Key aus .env oder nutzt Fallback für veröffentlichte Apps
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "BAAKqq0F1xbok5dmAg0bFJL6dvnPRzq-Pe53JEyL5nZbWvHSg5DZlFZHzwsxJZ2JkS9Q1uKJ4OtVDZsWEk";

  useEffect(() => {
    loadShopData();
  }, [user]);

  useEffect(() => {
    const fetchMyPurchases = async () => {
      if (!user) {
        setLoadingPurchases(false);
        return;
      }
      const supabase = getSupabase();
      
      const [kaeufeRes, vipRes] = await Promise.all([
        supabase.from('kaeufe').select('*').eq('user_id', user.id),
        supabase.from('vip_zugang').select('user_id').eq('user_id', user.id).maybeSingle()
      ]);

      if (!kaeufeRes.error && kaeufeRes.data) {
        setMyPurchases(kaeufeRes.data);
      }
      if (!vipRes.error && vipRes.data) {
        setIsVip(!!vipRes.data);
      }
      setLoadingPurchases(false);
    };

    fetchMyPurchases();
  }, [user]);

  useEffect(() => {
    try {
      if (window.location.hash && window.location.hash.startsWith('#product-')) {
        const hashRaw = window.location.hash;
        const targetId = hashRaw.replace('#', '');
        
        const timer = setTimeout(() => {
          try {
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              window.history.replaceState(null, '', window.location.pathname);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } catch (err) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 300);

        const fallbackTimer = setTimeout(() => {
          if (window.location.hash && window.location.hash.startsWith('#product-')) {
            window.history.replaceState(null, '', window.location.pathname);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 4000);

        return () => {
          clearTimeout(timer);
          clearTimeout(fallbackTimer);
        };
      }
    } catch (e) {
      console.error('Hash handling error:', e);
    }
  }, [produkte]);

  async function loadShopData() {
    try {
      const supabase = getSupabase();
      const { data: prodData, error: prodError } = await supabase.from('produkte').select('*');
      
      let finalProdukte = [];
      if (!prodError && prodData && prodData.length > 0) {
        finalProdukte = prodData;
      }

      let gekaufteSet: Set<string> = new Set();
      let userIsVip = false;

      if (user) {
        try {
          const [kaufRes, vipRes] = await Promise.all([
            supabase.from('kaeufe').select('produkt_id').eq('user_id', user.id),
            supabase.from('vip_zugang').select('user_id').eq('user_id', user.id).maybeSingle()
          ]);
          if (!kaufRes.error && kaufRes.data) {
            gekaufteSet = new Set(kaufRes.data.map((k: any) => k.produkt_id));
          }
          if (!vipRes.error && vipRes.data) {
            userIsVip = !!vipRes.data;
          }
        } catch (e) {
          console.warn('Could not fetch purchases or VIP status:', e);
        }
      }
      
      setProdukte(finalProdukte);
      setGekauftIds(gekaufteSet);
      setIsVip(userIsVip);
    } catch (error: any) {
      console.error("Fehler beim Laden:", error);
      setProdukte([]);
    } finally {
      setLoading(false);
    }
  }

  const baseCategories = ['Alle', 'Kostenfrei', 'Meditation', 'Entspannungsübungen', 'Selbsthypnose'];
  const categories = user ? [...baseCategories, 'Meine Käufe'] : baseCategories;

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredProdukte = produkte.filter(prod => {
    const matchesSearch = prod.titel?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.beschreibung?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    const catLower = prod.kategorie?.toLowerCase() || '';
    const titleLower = prod.titel?.toLowerCase() || '';

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

  if (loading) return <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">Inhalte werden aus der Datenbank geladen...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 pb-32 lg:p-6 lg:pb-12 font-sans bg-[var(--bg-main)] min-h-screen">
      <header className="mb-8 lg:mb-10 text-center">
        <h1 className="text-3xl lg:text-4xl font-serif text-[var(--text-main)]">Premium Inhalte</h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm italic">Entdecke unsere exklusiven Inhalte für Meditation, Entspannung und Selbsthypnose.</p>
      </header>

      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Suche nach Inhalten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === cat 
                  ? 'bg-[var(--accent)] text-white shadow-sm' 
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-alt)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {user && (
        <div className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-[var(--text-main)] mb-4">Meine gekauften Produkte</h3>
          
          {loadingPurchases ? (
            <p className="text-sm text-[var(--text-muted)] animate-pulse">Lade gekaufte Inhalte...</p>
          ) : myPurchases.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Du hast noch keine Produkte erworben.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {myPurchases.map((purchase) => {
                const prod = produkte.find(p => p.id === purchase.produkt_id);
                return (
                  <div key={purchase.id || purchase.produkt_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)]">
                    <div>
                      <p className="font-medium text-sm text-[var(--text-main)]">{prod?.titel || purchase.produkt_id}</p>
                      <p className="text-xs text-[var(--text-muted)]">Kaufdatum: {new Date(purchase.created_at || Date.now()).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Aktiviert</span>
                      <a 
                        href={`#product-${purchase.produkt_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(`product-${purchase.produkt_id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            window.location.hash = `product-${purchase.produkt_id}`;
                          }
                        }}
                        className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-main)] text-xs font-semibold rounded-lg text-[var(--text-main)] transition-all"
                      >
                        Zum Produkt
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {showUnlockBanner && <UnlockBanner />}
        
        {produkte.length === 0 && !loading && (
          <div className="text-center p-12 border border-[var(--border)] rounded-2xl bg-[var(--bg-card)]">
            <h3 className="text-xl font-medium text-[var(--text-main)] mb-2">Es sind noch keine Produkte verfügbar</h3>
            <p className="text-[var(--text-muted)]">Lade neue Inhalte über dein Supabase Dashboard hoch.</p>
          </div>
        )}

        {filteredProdukte.map((produkt: any) => {
          const istKostenlos = parseFloat(produkt.preis) === 0;
          const hatZugriff = isVip || gekauftIds.has(produkt.id) || istKostenlos;
          const isHeartOpening = produkt.id === HEART_OPENING_ID;

          if (isHeartOpening && !user) {
            return (
              <div key={produkt.id} id={`product-${produkt.id}`} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition hover:shadow-md">
                <div className="flex-1">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider rounded bg-[var(--bg-alt)] text-[var(--text-muted)] uppercase mb-3 inline-block">
                    {produkt.kategorie || 'Atemarbeit'}
                  </span>
                  <h2 className="text-xl lg:text-2xl font-bold text-[var(--text-main)]">{produkt.titel}</h2>
                  <p className="text-[var(--text-muted)] text-sm lg:text-base mt-2">{produkt.beschreibung}</p>
                </div>
                <div className="w-full lg:w-auto text-center lg:text-right text-sm text-[var(--text-muted)] italic font-medium pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
                  Kostenfrei nach Anmeldung
                </div>
              </div>
            );
          }

          return (
            <div key={produkt.id} id={`product-${produkt.id}`} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 flex flex-col transition hover:shadow-md">
              
              <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10">
                
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg bg-[var(--bg-alt)] text-[var(--text-muted)] uppercase">
                          {produkt.kategorie || 'Kategorie fehlt'}
                      </span>
                      {produkt.dauer && (
                          <span className="text-xs font-medium text-[var(--text-muted)]">
                          {formatDuration(produkt.dauer)} min
                          </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-semibold text-[var(--text-main)] mb-2 leading-tight">{produkt.titel}</h3>
                    
                    {!hatZugriff && !istKostenlos && (
                        <div className="text-[1.5rem] font-bold text-[var(--text-main)] mb-4">
                            {produkt.preis} €
                        </div>
                    )}
                    
                    <p className="text-[var(--text-muted)] text-sm lg:text-base leading-relaxed">{produkt.beschreibung}</p>
                </div>

                {!hatZugriff && (
                    <div className="lg:w-[45%] xl:w-[40%] pt-6 mt-2 lg:pt-0 lg:mt-0 border-t lg:border-t-0 lg:border-l border-[var(--border)]">
                        <div className="h-full w-full flex flex-col justify-center items-center lg:pl-8">
                            <div className="w-full max-w-md lg:max-w-[340px] flex flex-col gap-3">
                            {!user ? (
                                <div className="text-center p-5 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-alt)] rounded-xl border border-[var(--border)]">
                                    Bitte <Link to="/login" className="text-[var(--accent)] underline font-semibold transition-colors hover:text-[var(--accent-hover)]">einloggen</Link> oder <Link to="/register" className="text-[var(--accent)] underline font-semibold transition-colors hover:text-[var(--accent-hover)]">registrieren</Link>.
                                </div>
                            ) : (
                                isNativeApp ? (
                                    <GooglePlayCheckoutButton 
                                      produkt={produkt}
                                      user={user}
                                      setShowUnlockBanner={setShowUnlockBanner}
                                      onSuccess={loadShopData}
                                    />
                                ) : (
                                    <PayPalCheckoutButton 
                                      produkt={produkt} 
                                      user={user} 
                                      setShowUnlockBanner={setShowUnlockBanner}
                                      onSuccess={loadShopData} 
                                      paypalClientId={PAYPAL_CLIENT_ID}
                                    />
                                )
                            )}
                            </div>
                        </div>
                    </div>
                )}
              </div>

              {hatZugriff && (
                <div className="mt-8 pt-6 border-t border-[var(--border)]">
                    <AudioPlayerButton 
                      produkt={produkt} 
                      getUrl={async (p: any) => {
                        if (p.audio_path && p.audio_path.startsWith('http')) {
                          return p.audio_path;
                        }
                        const supabase = getSupabase();
                        const { data } = await supabase.storage.from('audio-bucket').getPublicUrl(`${p.id}.mp3`);
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

function GooglePlayCheckoutButton({ produkt, user, setShowUnlockBanner, onSuccess }: { produkt: any, user: any, setShowUnlockBanner: any, onSuccess: any }) {
  const [storeReady, setStoreReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    BillingService.init({
      productId: produkt.id, 
      onReady: () => setStoreReady(true),
      onSuccess: async () => {
        setIsProcessing(false);
        
        // UX: Tracking Event für GA4
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'purchase',
            ecommerce: {
              currency: 'EUR',
              value: parseFloat(produkt.preis),
              items: [{
                item_id: produkt.id,
                item_name: produkt.titel,
                price: parseFloat(produkt.preis)
              }]
            }
          });
        }

        const supabase = getSupabase();
        await supabase.from('kaeufe').insert([{
          user_id: user.id,
          produkt_id: produkt.id,
          paypal_order_id: 'GPLAY_' + Date.now(),
          preis: parseFloat(produkt.preis),
          waehrung: 'EUR',
          widerruf_verzicht_akzeptiert: true
        }]);
        setShowUnlockBanner(true);
        setTimeout(() => {
          onSuccess();
          setShowUnlockBanner(false);
        }, 2000);
      },
      onFailure: (msg) => {
        setIsProcessing(false);
        setError(msg);
      }
    });
  }, [produkt.id, user]);

  const handlePurchase = () => {
    setError(null);
    setIsProcessing(true);
    BillingService.startPurchase(produkt.id); 
  };

  return (
    <div className="w-full flex flex-col items-center">
      {error && (
        <div className="w-full text-xs text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] rounded-xl p-2 mb-3 font-medium text-center">
          {error}
        </div>
      )}
      <button
        onClick={handlePurchase}
        disabled={!storeReady || isProcessing}
        className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        <span>{storeReady ? 'Über Google Play kaufen' : 'Verbinde Play Store...'}</span>
      </button>
      <div className="text-center mt-3 text-[10px] text-[var(--text-muted)] italic">
        Sichere Zahlung über dein Google Konto.
      </div>
    </div>
  );
}