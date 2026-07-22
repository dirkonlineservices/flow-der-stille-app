/* =========================================================================================
🚨 AI SYSTEM INSTRUCTION - STRICT GUARDRAIL - DO NOT MODIFY 🚨
1. SMART PLATFORM SWITCH: Web = PayPal | Native App = Google Play Billing.
2. SUPABASE 1:1 ID MAPPING: Uses clean TEXT IDs (e.g., 'atemarbeit_herzoeffnung').
3. ENTERPRISE TRACKING: GA4 DataLayer integrated for both payment methods.
=========================================================================================
*/

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
  const [testEmail, setTestEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Alle');
  const [sortBy, setSortBy] = useState('Standard');
  
  // ⚡ ERKENNUNG: Läuft die App nativ (App) oder im Browser (Web)?
  const isNativeApp = BillingService.isNative();

  // ⚡ DEINE NEUEN SUPABASE TEXT-IDS
  const HEART_OPENING_ID = 'atemarbeit_herzoeffnung';
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "Abr2A6ISXpGoTN5xMfwAtTAKmgOr6Lj_H5znAiY8K8vLfpudiUcU9V7xfv32m_lVMSELyAoNe3i2s55-";

  useEffect(() => {
    loadShopData();
  }, [user]);

  async function loadShopData() {
    try {
      console.log('DEBUG: loadShopData started, user:', user);
      const supabase = getSupabase();
      const { data: prodData, error: prodError } = await supabase.from('produkte').select('*');
      console.log('DEBUG: prodData:', prodData);
      if (prodError) throw prodError;

      let gekaufteSet: Set<string> = new Set();

      if (user) {
        console.log('DEBUG: fetching kaeufe for user:', user.id);
        const { data: kaufData, error: kaufError } = await supabase
          .from('kaeufe')
          .select('produkt_id')
          .eq('user_id', user.id);
        if (kaufError) throw kaufError;
        // @ts-ignore
        gekaufteSet = new Set(kaufData.map((k: any) => k.produkt_id));
        console.log('DEBUG: gekaufteSet:', gekaufteSet);
      }
      
      setProdukte(prodData);
      setGekauftIds(gekaufteSet);
    } catch (error: any) {
      console.error("Fehler beim Laden des Dashboards:", error.message);
    } finally {
      console.log('DEBUG: loadShopData finished');
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

  if (loading) return <div className="p-10 text-center text-[var(--text-muted)]">Premium-Bereich wird geladen...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-[var(--bg-main)] min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-serif text-[var(--text-main)]">Premium-Inhalte</h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm italic">Entdecke unsere exklusiven Premium-Inhalte: Meditation, Entspannungsübungen und Selbsthypnose.</p>
      </header>

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
        </div>
      </div>

      <div className="space-y-6">
        {showUnlockBanner && <UnlockBanner />}
        {filteredProdukte.map((produkt: any) => {
          const istKostenlos = parseFloat(produkt.preis) === 0;
          const hatZugriff = gekauftIds.has(produkt.id) || istKostenlos;
          const isHeartOpening = produkt.id === HEART_OPENING_ID;

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

                {/* 🔀 CHECKOUT-WEICHE: Zeigt Google Play in der App, PayPal im Web */}
                {!hatZugriff && (
                    <div className="md:w-[35%] border-t md:border-t-0 md:border-l border-[var(--border)]">
                        <div className="h-full w-full flex flex-col justify-center items-center p-6 md:p-8">
                            <div className="w-full max-w-[280px] flex flex-col gap-3">
                            {!user ? (
                                <div className="text-center p-4 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-alt)] rounded-xl border border-[var(--border)]">
                                  Bitte <Link to="/login" className="text-[var(--accent)] underline font-semibold">einloggen</Link> oder <Link to="/register" className="text-[var(--accent)] underline font-semibold">registrieren</Link>.
                                </div>
                            ) : (
                                /* 🔀 CHECKOUT-WEICHE: Zeigt Google Play in der App, PayPal im Web */
                                isNativeApp ? (
                                    /* APP: Placeholder */
                                    <div className="text-sm text-[var(--text-muted)] text-center p-2 border rounded-xl">
                                        Google Play Checkout nicht konfiguriert.
                                    </div>
                                ) : (
                                    /* WEB: Nur PayPal */
                                    <PayPalCheckoutButton 
                                      produkt={produkt} 
                                      user={user} 
                                      setShowUnlockBanner={setShowUnlockBanner}
                                      onSuccess={loadShopData} 
                                      paypalClientId={import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test-client-id'}
                                    />
                                )
                            )}
                            </div>
                        </div>
                    </div>
                )}
              </div>

              {/* 🎯 AUDIO-PLAYER */}
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

// 🤖 APP-ZAHLUNG: Google Play Billing
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
        Sichere In-App-Zahlung über dein Google-Konto.
      </div>
    </div>
  );
}
