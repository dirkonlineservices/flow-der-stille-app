import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Search, CreditCard, Loader2, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { AudioPlayerButton } from './AudioPlayerButton';
import { PayPalCheckoutButton } from './PayPalCheckoutButton';
import { ProductDisclaimerTrigger } from './ProductDisclaimerTrigger';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UnlockBanner from './UnlockBanner';
import { BillingService, getPlayStoreProductId, REVERSE_PLAY_STORE_PRODUCT_MAP, pushToDataLayer } from '../lib/billing';
import { handlePurchaseSuccess } from '../lib/googlePlayVerification';
import { transactionLogger } from '../lib/transactionLogger';
import { HoerprobenPlayer } from './HoerprobenPlayer';

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
  const HEART_OPENING_ID = 'fds_herzoeffnung_meditation';
  
  // Zieht den Key aus .env oder nutzt Fallback für veröffentlichte Apps
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "BAAKqq0F1xbok5dmAg0bFJL6dvnPRzq-Pe53JEyL5nZbWvHSg5DZlFZHzwsxJZ2JkS9Q1uKJ4OtVDZsWEk";

  useEffect(() => {
    loadShopData();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyPurchases();
    } else {
      setMyPurchases([]);
      setLoadingPurchases(false);
    }
  }, [user, gekauftIds]);

  const fetchMyPurchases = async () => {
    if (!user) return;
    try {
      setLoadingPurchases(true);
      const supabase = getSupabase();

      const targetUserIds: string[] = [user.id];
      const cleanEmail = (user.email || '').toLowerCase().trim();
      let aliasEmail: string | null = null;
      if (cleanEmail.endsWith('@gmail.com')) {
        aliasEmail = cleanEmail.replace('@gmail.com', '@googlemail.com');
      } else if (cleanEmail.endsWith('@googlemail.com')) {
        aliasEmail = cleanEmail.replace('@googlemail.com', '@gmail.com');
      }

      if (aliasEmail) {
        const { data: aliasProfiles } = await supabase
          .from('profiles')
          .select('id')
          .in('email', [cleanEmail, aliasEmail]);

        if (aliasProfiles && aliasProfiles.length > 0) {
          aliasProfiles.forEach((p: any) => {
            if (p.id && !targetUserIds.includes(p.id)) {
              targetUserIds.push(p.id);
            }
          });
        }
      }

      const { data, error } = await supabase
        .from('kaeufe')
        .select('*')
        .in('user_id', targetUserIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden meiner Einkäufe:', error);
      } else {
        setMyPurchases(data || []);
      }
    } catch (e) {
      console.error('Exception beim Laden meiner Einkäufe:', e);
    } finally {
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#product-') && produkte.length > 0) {
        const targetId = hash.replace('#product-', '');
        const timer = setTimeout(() => {
          const el = document.getElementById(`product-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        
        const fallbackTimer = setTimeout(() => {
          const el = document.getElementById(`product-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 1000);

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
          // Automatic resolution for @gmail.com <-> @googlemail.com aliases
          const targetUserIds: string[] = [user.id];
          const cleanEmail = (user.email || '').toLowerCase().trim();
          let aliasEmail: string | null = null;
          if (cleanEmail.endsWith('@gmail.com')) {
            aliasEmail = cleanEmail.replace('@gmail.com', '@googlemail.com');
          } else if (cleanEmail.endsWith('@googlemail.com')) {
            aliasEmail = cleanEmail.replace('@googlemail.com', '@gmail.com');
          }

          if (aliasEmail) {
            const { data: aliasProfiles } = await supabase
              .from('profiles')
              .select('id')
              .in('email', [cleanEmail, aliasEmail]);

            if (aliasProfiles && aliasProfiles.length > 0) {
              aliasProfiles.forEach((p: any) => {
                if (p.id && !targetUserIds.includes(p.id)) {
                  targetUserIds.push(p.id);
                }
              });
            }
          }

          const [kaufRes, vipRes] = await Promise.all([
            supabase.from('kaeufe').select('produkt_id').in('user_id', targetUserIds),
            supabase.from('vip_zugang').select('user_id').in('user_id', targetUserIds)
          ]);
          const ids = new Set<string>();

          if (!kaufRes.error && kaufRes.data) {
            kaufRes.data.forEach((k: any) => {
              const rawId = k.produkt_id;
              if (rawId) {
                ids.add(rawId);
                const playId = getPlayStoreProductId(rawId);
                ids.add(playId);
                const dbId = REVERSE_PLAY_STORE_PRODUCT_MAP[rawId] || REVERSE_PLAY_STORE_PRODUCT_MAP[playId];
                if (dbId) ids.add(dbId);
              }
            });
          }

          gekaufteSet = ids;
          if (!vipRes.error && vipRes.data) {
            userIsVip = vipRes.data.length > 0;
          }
        } catch (e) {
          console.warn('Could not fetch purchases or VIP status:', e);
        }
      }
      
      setProdukte(finalProdukte);
      setGekauftIds(gekaufteSet);
      setIsVip(userIsVip);

      // 1. Produkte als Array initialisieren (Batch-Registrierung für Cordova Purchase Store)
      if (BillingService.isNative() && finalProdukte.length > 0) {
        BillingService.registerAllProducts(finalProdukte, async (transaction?: any) => {
          const purchaseToken = transaction?.purchaseToken || transaction?.id || ('GPLAY_' + Date.now());
          const productId = transaction?.productId || 'fds_hypnose_selbstbewusstsein';
          
          const vResult = await handlePurchaseSuccess({
            purchaseToken,
            productId: productId,
            price: 1.99
          }, user.id);

          setShowUnlockBanner(true);
          setTimeout(() => {
            loadShopData();
            setShowUnlockBanner(false);
          }, 2500);

          return vResult;
        });
      }
    } catch (error: any) {
      console.error("Fehler beim Laden:", error);
      setProdukte([]);
    } finally {
      setLoading(false);
    }
  }

  const getProductCoverImage = (prod: any) => {
    if (prod.image_url) return prod.image_url;
    
    const id = prod.id?.toLowerCase() || '';
    const title = prod.titel?.toLowerCase() || '';
    const kat = prod.kategorie?.toLowerCase() || '';

    if (id.includes('herzoeffnung') || title.includes('herzöffnung') || title.includes('herz-öffnung')) {
      return '/images/products/cover_herzoeffnung.jpg';
    }
    if (id.includes('pmr') || title.includes('muskelentspannung') || title.includes('progressive')) {
      return '/images/products/cover_pmr.jpg';
    }
    if (id.includes('atem') || title.includes('atemarbeit') || title.includes('pranayama')) {
      return '/images/products/cover_atemarbeit.jpg';
    }
    if (id.includes('loslassen') || title.includes('loslassen')) {
      return '/images/products/cover_loslassen.jpg';
    }
    if (id.includes('fokus') || title.includes('fokus') || title.includes('klarheit')) {
      return '/images/products/cover_fokus.jpg';
    }
    if (id.includes('selbstbewusstsein') || id.includes('vertrauen') || title.includes('selbstbewusstsein') || title.includes('vertrauen')) {
      return '/images/products/cover_selbstbewusst.jpg';
    }
    if (id.includes('ernaehrung') || id.includes('gesund') || title.includes('ernährung') || title.includes('lebensstil')) {
      return '/images/products/cover_ernaehrung.jpg';
    }
    
    if (kat.includes('meditation')) return '/images/products/cover_herzoeffnung.jpg';
    if (kat.includes('hypnose')) return '/images/products/cover_fokus.jpg';
    return '/images/products/cover_loslassen.jpg';
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
        matchesCategory = catLower.includes('hypnose') || titleLower.includes('hypnose') || titleLower.includes('selbstbewusstsein') || titleLower.includes('fokus') || titleLower.includes('ernährung');
    }

    return matchesSearch && matchesCategory;
  });

  const formatDuration = (dauerStr: any) => {
    if (!dauerStr && dauerStr !== 0) return '';
    const str = String(dauerStr).trim();
    if (str.includes(':')) {
      const parts = str.split(':');
      if (parts.length === 2) {
        const min = parseInt(parts[0], 10);
        const sec = parseInt(parts[1], 10);
        return `${isNaN(min) ? 0 : min}:${isNaN(sec) ? '00' : (sec < 10 ? '0' + sec : sec)}`;
      }
      if (parts.length === 3) {
        const totalMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        const sec = parseInt(parts[2], 10);
        return `${isNaN(totalMin) ? 0 : totalMin}:${isNaN(sec) ? '00' : (sec < 10 ? '0' + sec : sec)}`;
      }
      return str;
    }
    const totalSeconds = parseInt(str.replace(/\D/g, ''), 10);
    if (isNaN(totalSeconds)) return str;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSec = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${minutes}:${formattedSec}`;
  };

  const categories = ['Alle', 'Meditation', 'Selbsthypnose', 'Entspannungsübungen', 'Kostenfrei', 'Hörprobe'];

  const getCategoryBadgeStyle = (katStr: string = '') => {
    const k = katStr.toLowerCase();
    if (k.includes('meditation')) return 'bg-amber-500/90 text-white border border-amber-300/30';
    if (k.includes('hypnose')) return 'bg-indigo-600/90 text-white border border-indigo-300/30';
    if (k.includes('entspannung') || k.includes('pmr') || k.includes('atem')) return 'bg-teal-600/90 text-white border border-teal-300/30';
    return 'bg-stone-700/90 text-white border border-stone-400/30';
  };

  const sortedProdukte = [...filteredProdukte].sort((a, b) => {
      if (sortBy === 'Preis: Aufsteigend') {
          return parseFloat(a.preis) - parseFloat(b.preis);
      } else if (sortBy === 'Preis: Absteigend') {
          return parseFloat(b.preis) - parseFloat(a.preis);
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
                const prod = produkte.find(p => p.id === purchase.produkt_id || getPlayStoreProductId(p.id) === purchase.produkt_id);
                return (
                  <div key={purchase.id || purchase.produkt_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)]">
                    <div>
                      <p className="font-medium text-sm text-[var(--text-main)]">{prod?.titel || purchase.produkt_id}</p>
                      <p className="text-xs text-[var(--text-muted)]">Kaufdatum: {new Date(purchase.created_at || Date.now()).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={`#product-${purchase.produkt_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(`product-${purchase.produkt_id}`) || document.getElementById(`product-${prod?.id}`);
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

        {sortedProdukte.map((produkt: any) => {
          const istKostenlos = parseFloat(produkt.preis) === 0;
          const playId = getPlayStoreProductId(produkt.id);
          const hatZugriff = isVip || gekauftIds.has(produkt.id) || gekauftIds.has(playId) || istKostenlos;

          if (produkt.id === HEART_OPENING_ID && !user) {
            return (
              <div key={produkt.id} id={`product-${produkt.id}`} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 lg:p-7 flex flex-col transition hover:shadow-lg overflow-hidden">
                <div className="relative h-48 sm:h-56 w-full mb-6 rounded-xl overflow-hidden shadow-sm group">
                  <img 
                    src={getProductCoverImage(produkt)} 
                    alt={produkt.titel} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg uppercase shadow-md bg-amber-500/90 text-white border border-amber-300/30">
                      Kostenfreies Audio
                    </span>
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wide text-white/95 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 shadow-md">
                    ✨ KI-Design
                  </span>
                  {produkt.dauer && (
                    <span className="absolute bottom-3 right-3 text-xs font-semibold text-white/95 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                      ⏱ {formatDuration(produkt.dauer)} Min.
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl lg:text-3xl font-semibold text-[var(--text-main)] mb-2 leading-tight">{produkt.titel}</h3>
                  <p className="text-[var(--text-muted)] text-sm lg:text-base leading-relaxed mb-4">{produkt.beschreibung}</p>
                </div>
                <div className="w-full lg:w-auto text-center lg:text-right text-sm text-[var(--text-muted)] italic font-medium pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
                  Kostenfrei nach Anmeldung
                </div>
              </div>
            );
          }

          return (
            <div key={produkt.id} id={`product-${produkt.id}`} className={`bg-[var(--bg-card)] border ${hatZugriff && !istKostenlos ? 'border-emerald-300 dark:border-emerald-800 shadow-emerald-500/5' : 'border-[var(--border)]'} rounded-2xl p-5 lg:p-7 flex flex-col transition hover:shadow-lg overflow-hidden`}>
              
              {/* Cover Image Header Banner */}
              <div className="relative h-48 sm:h-56 w-full mb-6 rounded-xl overflow-hidden shadow-sm group">
                <img 
                  src={getProductCoverImage(produkt)} 
                  alt={produkt.titel} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg uppercase shadow-md ${getCategoryBadgeStyle(produkt.kategorie)}`}>
                    {produkt.kategorie || 'Kategorie'}
                  </span>
                  {hatZugriff && !istKostenlos && (
                    <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg bg-emerald-600 text-white uppercase shadow-md flex items-center gap-1">
                      ✓ Freigeschaltet
                    </span>
                  )}
                </div>
                <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wide text-white/95 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 shadow-md">
                  ✨ KI-Design
                </span>
                {produkt.dauer && (
                  <span className="absolute bottom-3 right-3 text-xs font-semibold text-white/95 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    ⏱ {formatDuration(produkt.dauer)} Min.
                  </span>
                )}
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10">
                
                <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl lg:text-3xl font-semibold text-[var(--text-main)] mb-2 leading-tight">{produkt.titel}</h3>
                    
                    {!hatZugriff && !istKostenlos && (
                        <div className="text-[1.5rem] font-bold text-[var(--text-main)] mb-4">
                            {produkt.preis} €
                        </div>
                    )}
                    
                    <p className="text-[var(--text-muted)] text-sm lg:text-base leading-relaxed">{produkt.beschreibung}</p>

                    {produkt.audio_hinweis && (
                      <div className="mt-4 p-3 bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)] flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                        <span className="leading-snug">{produkt.audio_hinweis}</span>
                      </div>
                    )}

                    {/* Kostenlose Hörprobe – nur anzeigen wenn URL in Supabase befüllt */}
                    <HoerprobenPlayer produkt={produkt} />
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
                <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col gap-4">
                    {istKostenlos && !user && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-amber-900 dark:text-amber-200 shadow-sm mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-700 dark:text-amber-300 shrink-0">
                            <Lock size={22} />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-base mb-1">Kostenloses Audio nach Registrierung anhören</h4>
                            <p className="text-xs sm:text-sm opacity-90 mb-4 leading-relaxed">
                              Dieses kostenlose Audio steht nach einer kostenlosen und unverbindlichen Registrierung sofort für dich bereit.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <Link 
                                to="/register" 
                                className="px-4 py-2 bg-[var(--accent)] text-white text-xs sm:text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
                              >
                                Jetzt kostenlos registrieren
                              </Link>
                              <Link 
                                to="/login" 
                                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 text-xs sm:text-sm font-semibold rounded-xl border border-stone-800 transition shadow-sm"
                              >
                                Anmelden
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                    <div className="flex justify-end">
                      <ProductDisclaimerTrigger />
                    </div>
                </div>
              )}

              {!hatZugriff && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-end">
                  <ProductDisclaimerTrigger />
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playId = getPlayStoreProductId(produkt.id);

  useEffect(() => {
    let isMounted = true;
    BillingService.init({
      productId: produkt.id, 
      onReady: () => {
        if (isMounted) setStoreReady(true);
      }
    });
    const t = setTimeout(() => {
      if (isMounted) setStoreReady(true);
    }, 1000);
    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [produkt.id]);

  const handlePurchase = async () => {
    if (!acceptedTerms) {
      setError("Bitte stimme vor dem Kauf dem Widerrufsverzicht zu.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      await BillingService.startPurchase(produkt, async (msg) => {
        setIsProcessing(false);

        const isOwnedMsg = msg && (
          msg.includes("Kauf gefunden") || 
          msg.includes("synchronisiert") || 
          msg.includes("ITEM_ALREADY_OWNED") ||
          msg.includes("bereits gekauft")
        );

        if (isOwnedMsg) {
          setError("Kauf in Google Play gefunden. Schalte Inhalte frei...");
          
          try {
            let purchaseToken = 'GPLAY_OWNED_' + Date.now();
            try {
              const CdvPurchase = (window as any).CdvPurchase;
              if (CdvPurchase && CdvPurchase.store) {
                const p = CdvPurchase.store.get(playId) || CdvPurchase.store.get(produkt.id);
                if (p && p.transaction) {
                  purchaseToken = p.transaction.purchaseToken || p.transaction.id || purchaseToken;
                  if (typeof p.transaction.finish === 'function') {
                    await p.transaction.finish();
                  }
                }
              }
            } catch (e) {}

            // WICHTIG: Erzwinge Eintrag in Supabase public.kaeufe & Profil-Update!
            await handlePurchaseSuccess({
              purchaseToken,
              productId: produkt.id,
              price: parseFloat(produkt.preis) || 1.99
            }, user.id);

            setShowUnlockBanner(true);
            await onSuccess(); // Lädt Shop-Daten sofort neu, aktualisiert gekaufteSet und schaltet Play Button frei!
            setError(null);
            setTimeout(() => {
              setShowUnlockBanner(false);
            }, 2000);
          } catch (syncErr) {
            console.error("Sync-Fehler bei ITEM_ALREADY_OWNED:", syncErr);
            onSuccess();
          }
        } else {
          setError(msg);
        }
      });
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Bezahlvorgang konnte nicht gestartet werden.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 3500);
    }
  };

  const isInfoMsg = error && (
    error.includes("Kauf") || 
    error.includes("synchronisiert") || 
    error.includes("freigeschaltet") ||
    error.includes("Verbindung") ||
    error.includes("geladen") ||
    error.includes("erstattet") ||
    error.includes("storniert") ||
    error.includes("bereits")
  );

  return (
    <div className="w-full flex flex-col items-center">
      <label className={`flex items-start gap-3 p-3.5 mb-3 rounded-xl cursor-pointer transition-colors border text-left ${acceptedTerms ? 'bg-[var(--bg-main)] border-[var(--accent)]' : 'bg-[var(--bg-alt)] border-[var(--border)] hover:bg-[var(--bg-main)]'}`}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[var(--accent)] cursor-pointer shrink-0"
        />
        <span className="flex-1 text-xs text-[var(--text-muted)] leading-relaxed">
          Ich stimme ausdrücklich zu, dass mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist begonnen wird. <strong>Mir ist bekannt, dass ich dadurch mein Widerrufsrecht verliere.</strong>
        </span>
      </label>

      {error && (
        <div className={`w-full text-xs rounded-xl p-2.5 mb-3 font-medium text-center border ${
          isInfoMsg 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800' 
            : 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca]'
        }`}>
          {error}
        </div>
      )}
      <button
        onClick={handlePurchase}
        disabled={!storeReady || isProcessing || !acceptedTerms}
        className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        <span>{storeReady ? `Über Google Play kaufen (${produkt.preis} €)` : 'Verbinde Play Store...'}</span>
      </button>
      <div className="text-center mt-3 text-[10px] text-[var(--text-muted)] italic">
        Sichere Zahlung über dein Google Konto.
      </div>
    </div>
  );
}