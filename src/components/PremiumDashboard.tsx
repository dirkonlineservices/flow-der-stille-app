import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Search, CreditCard, Loader2, Lock, Sparkles, CheckCircle2, Mail, ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { AudioPlayerButton } from './AudioPlayerButton';
import { PayPalCheckoutButton } from './PayPalCheckoutButton';
import { ProductDisclaimerTrigger } from './ProductDisclaimerTrigger';
import { useAuth } from '../context/AuthContext';
import UnlockBanner from './UnlockBanner';
import { BillingService, getPlayStoreProductId, REVERSE_PLAY_STORE_PRODUCT_MAP, pushToDataLayer } from '../lib/billing';
import { handlePurchaseSuccess } from '../lib/googlePlayVerification';
import { transactionLogger } from '../lib/transactionLogger';
import { HoerprobenPlayer } from './HoerprobenPlayer';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { PurchaseToast, PurchaseToastData } from './PurchaseToast';
import { offlineManager } from '../lib/offlineAudioService';
import { 
  getOfflineProducts, 
  saveOfflineProducts, 
  getOfflineProductById, 
  getCachedPurchases, 
  saveCachedPurchases 
} from '../lib/offlineProductsService';
import { ProductRating } from './ProductRating';
import { getAllProductRatings } from '../lib/reviewsService';

export default function PremiumShopDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ⚡ Sofortige Offline-Verfügbarkeit für den Flugmodus (0ms Ladezeit)
  const initialProducts = getOfflineProducts();
  const [produkte, setProdukte] = useState<any[]>(initialProducts);
  const [gekauftIds, setGekauftIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    offlineManager.getPurchasedProducts().forEach(id => set.add(id));
    return set;
  });
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Alle');
  const [sortBy, setSortBy] = useState('Standard');
  const [searchParams] = useSearchParams();
  const [productRatings, setProductRatings] = useState<Record<string, { average: number; count: number }>>({});

  useEffect(() => {
    getAllProductRatings().then(ratings => {
      if (ratings && Object.keys(ratings).length > 0) {
        setProductRatings(ratings);
      }
    });
  }, []);

  // ─── Menü für gekaufte Produkte: standardmäßig eingeklappt ───────────────
  const [isPurchasedMenuOpen, setIsPurchasedMenuOpen] = useState(false);

  // ─── Gekaufte Produktkarten im Katalog: standardmäßig eingeklappt ─────────
  // Set enthält die IDs der aktuell AUFGEKLAPPTEN Karten
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const expandAllPurchased = () => {
    const allPurchasedIds = produkte
      .filter(p => {
        const playId = getPlayStoreProductId(p.id);
        return isVip || gekauftIds.has(p.id) || gekauftIds.has(playId) || offlineManager.isPurchasedOffline(p.id);
      })
      .map(p => p.id);
    setExpandedProducts(new Set(allPurchasedIds));
  };

  const collapseAllPurchased = () => {
    setExpandedProducts(new Set());
  };

  // URL-Filter-Parameter beim ersten Laden auslesen (?filter=Meditation etc.)
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    }
  }, []);

  // Nach Login-Redirect: Zum Produkt scrollen wenn ein #product-XXX Hash in der URL steckt
  useEffect(() => {
    const hash = location.hash; // z.B. "#product-fds_herzoeffnung_meditation"
    if (!hash || !hash.startsWith('#product-')) return;

    // Warte bis Produkte gerendert sind (Daten aus Supabase brauchen einen Moment)
    const scrollToProduct = () => {
      const el = document.getElementById(hash.slice(1)); // hash ohne das "#"
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Hash nach dem Scrollen entfernen damit er nicht stört
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    // Versuch 1: sofort (für den Fall, dass Produkte schon gecacht sind)
    const t1 = setTimeout(scrollToProduct, 400);
    // Versuch 2: nach längerer Wartezeit (Supabase-Ladeverzögerung)
    const t2 = setTimeout(scrollToProduct, 1400);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.hash, loading]);

  const handleJumpToProduct = (productId: string) => {
    setActiveFilter('Alle');
    setTimeout(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.location.hash = `product-${productId}`;
      }
    }, 100);
  };
  
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
    // 1. Sofort aus lokalem Cache laden (0ms Ladezeit im Flugmodus)
    const cached = getCachedPurchases();
    if (cached && cached.length > 0) {
      setMyPurchases(cached);
      setLoadingPurchases(false);
    }

    // Falls keine DB-Käufe im Cache, aber offlineManager hat IDs:
    const offlineIds = offlineManager.getPurchasedProducts();
    if ((!cached || cached.length === 0) && offlineIds.length > 0) {
      const fallbackList = offlineIds.map(id => ({
        id: `offline_${id}`,
        produkt_id: id,
        created_at: new Date().toISOString()
      }));
      setMyPurchases(fallbackList);
      setLoadingPurchases(false);
    }

    if (!user) {
      setLoadingPurchases(false);
      return;
    }

    try {
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
        try {
          const { data: aliasProfiles } = await Promise.race([
            supabase.from('profiles').select('id').in('email', [cleanEmail, aliasEmail]),
            new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2500))
          ]);
          if (aliasProfiles && aliasProfiles.length > 0) {
            aliasProfiles.forEach((p: any) => {
              if (p.id && !targetUserIds.includes(p.id)) {
                targetUserIds.push(p.id);
              }
            });
          }
        } catch {}
      }

      // Schneller Timeout gegen Netzwerk-Hänger im Flugmodus
      const { data, error } = await Promise.race([
        supabase.from('kaeufe').select('*').in('user_id', targetUserIds).order('created_at', { ascending: false }),
        new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 3000))
      ]);

      if (!error && data) {
        setMyPurchases(data);
        saveCachedPurchases(data);
      }
    } catch (e) {
      console.log('[OfflineMode] Verwende gecachte Einkäufe im Flugmodus');
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
      // 1. Zuerst immer den gebündelten / gecachten Offline-Katalog laden (sofort sichtbar!)
      let finalProdukte = getOfflineProducts();
      setProdukte(finalProdukte);

      const supabase = getSupabase();
      try {
        const prodRes: any = await Promise.race([
          supabase.from('produkte').select('*'),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Products Timeout')), 3500))
        ]);
        if (!prodRes.error && prodRes.data && prodRes.data.length > 0) {
          finalProdukte = prodRes.data;
          saveOfflineProducts(prodRes.data);
          setProdukte(finalProdukte);
        }
      } catch (netErr) {
        console.log('[OfflineMode] Supabase Produkte nicht erreichbar, nutze Offline-Katalog:', netErr);
      }

      let gekaufteSet: Set<string> = new Set();
      let userIsVip = false;

      // Offline gespeicherte Käufe hinzunehmen (für Flugmodus & Web-Offline)
      const offlineIds = offlineManager.getPurchasedProducts();
      offlineIds.forEach((offId) => {
        gekaufteSet.add(offId);
        const pId = getPlayStoreProductId(offId);
        gekaufteSet.add(pId);
        const dbId = REVERSE_PLAY_STORE_PRODUCT_MAP[offId] || REVERSE_PLAY_STORE_PRODUCT_MAP[pId];
        if (dbId) gekaufteSet.add(dbId);
      });

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
            try {
              const aliasRes: any = await Promise.race([
                supabase.from('profiles').select('id').in('email', [cleanEmail, aliasEmail]),
                new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2500))
              ]);
              if (aliasRes?.data && aliasRes.data.length > 0) {
                aliasRes.data.forEach((p: any) => {
                  if (p.id && !targetUserIds.includes(p.id)) {
                    targetUserIds.push(p.id);
                  }
                });
              }
            } catch {}
          }

          const [kaufRes, vipRes]: any = await Promise.race([
            Promise.all([
              supabase.from('kaeufe').select('produkt_id').in('user_id', targetUserIds),
              supabase.from('vip_zugang').select('user_id').in('user_id', targetUserIds)
            ]),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Purchases Timeout')), 3500))
          ]);

          if (!kaufRes?.error && kaufRes?.data) {
            kaufRes.data.forEach((k: any) => {
              const rawId = k.produkt_id;
              if (rawId) {
                gekaufteSet.add(rawId);
                const playId = getPlayStoreProductId(rawId);
                gekaufteSet.add(playId);
                const dbId = REVERSE_PLAY_STORE_PRODUCT_MAP[rawId] || REVERSE_PLAY_STORE_PRODUCT_MAP[playId];
                if (dbId) gekaufteSet.add(dbId);
              }
            });
          }

          // Nach erfolgreicher Prüfung den Stand lokal sichern
          if (gekaufteSet.size > 0) {
            offlineManager.savePurchasedProducts(Array.from(gekaufteSet));
          }

          if (!vipRes?.error && vipRes?.data) {
            userIsVip = vipRes.data.length > 0;
          }
        } catch (e) {
          console.log('[OfflineMode] Verwende Offline-Kaufstatus im Flugmodus');
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

  const handleProductPurchaseSuccess = async (prod: any) => {
    await loadShopData();
    const id = prod?.id?.toLowerCase() || '';
    const title = prod?.titel?.toLowerCase() || '';
    const kat = prod?.kategorie?.toLowerCase() || '';
    const isAudiobook = id.includes('schmetterling') || id.includes('hoerbuch') || 
                        title.includes('schmetterling') || title.includes('hörbuch') || title.includes('hoerbuch') ||
                        kat.includes('hörbuch') || kat.includes('hoerbuch');
    if (isAudiobook) {
      setTimeout(() => {
        navigate(`/hoerbuch/${prod.id || 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte'}?purchased=true&play=true`);
      }, 1500);
    }
  };

  const getProductCoverImage = (prod: any) => {
    if (prod.image_url) return prod.image_url;
    
    const id = prod.id?.toLowerCase() || '';
    const title = prod.titel?.toLowerCase() || '';
    const kat = prod.kategorie?.toLowerCase() || '';

    if (id.includes('schmetterling') || id.includes('hoerbuch') || title.includes('schmetterling') || title.includes('hörbuch') || title.includes('hoerbuch')) {
      return '/images/products/cover_schmetterling.jpg';
    }
    if (id.includes('schlaf') || title.includes('schlaf')) {
      return '/images/products/cover_schlaf.jpg';
    }
    if (id.includes('inneres_kind') || id.includes('inneres-kind') || title.includes('inneres kind')) {
      return '/images/products/cover_inneres_kind.jpg';
    }
    if (id.includes('herzkompass') || title.includes('herzkompass')) {
      return '/images/products/cover_herzkompass.jpg';
    }
    if (id.includes('herzoeffnung') || title.includes('herzöffnung') || title.includes('herz-öffnung')) {
      return '/images/products/cover_herzoeffnung.jpg';
    }
    if (id.includes('innere_ruhe') || id.includes('innere-ruhe') || title.includes('innere ruhe')) {
      return '/images/products/cover_innere_ruhe.jpg';
    }
    if (id.includes('loslassen') || title.includes('loslassen')) {
      return '/images/products/cover_loslassen.jpg';
    }
    if (id.includes('pmr') || title.includes('muskelentspannung') || title.includes('progressive')) {
      return '/images/products/cover_pmr.jpg';
    }
    if (id.includes('atem') || title.includes('atemarbeit') || title.includes('pranayama')) {
      return '/images/products/cover_atemarbeit.jpg';
    }
    if (id.includes('fokus') || title.includes('fokus') || title.includes('klarheit')) {
      return '/images/products/cover_fokus.jpg';
    }
    if (id.includes('vertrauen') && !id.includes('selbstbewusstsein')) {
      return '/images/products/cover_vertrauen.jpg';
    }
    if (id.includes('selbstbewusstsein') || title.includes('selbstbewusstsein') || title.includes('vertrauen')) {
      return '/images/products/cover_selbstbewusst.jpg';
    }
    if (id.includes('ernaehrung') || id.includes('gesund') || title.includes('ernährung') || title.includes('lebensstil')) {
      return '/images/products/cover_ernaehrung.jpg';
    }
    if (title.includes('herz')) {
      return '/images/products/cover_herz.jpg';
    }

    if (kat.includes('hörbuch') || kat.includes('hoerbuch')) return '/images/products/cover_schmetterling.jpg';
    if (kat.includes('meditation')) return '/images/products/cover_innere_ruhe.jpg';
    if (kat.includes('hypnose')) return '/images/products/cover_fokus.jpg';
    return '/images/products/cover_loslassen.jpg';
  };

  const isProductPurchased = (prod: any) => {
    if (!prod) return false;
    const playId = getPlayStoreProductId(prod.id);
    return isVip || gekauftIds.has(prod.id) || gekauftIds.has(playId) || offlineManager.isPurchasedOffline(prod.id);
  };

  const purchasedProductsCount = produkte.filter(p => isProductPurchased(p) && parseFloat(p.preis) > 0).length;

  const filteredProdukte = produkte.filter(prod => {
    // 1. Inaktive Produkte laut Supabase (is_active = false) automatisch ausblenden
    if (prod.is_active === false) {
      return false;
    }

    // Deaktivierte Produkte im Frontend ausblenden (z. B. "meditation_loslassen")
    const pId = (prod.id || '').toLowerCase();
    const pTitle = (prod.titel || '').toLowerCase();
    if (pId.includes('loslassen') || pTitle.includes('loslassen')) {
      return false;
    }

    const matchesSearch = prod.titel?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.beschreibung?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    const catLower = prod.kategorie?.toLowerCase() || '';
    const titleLower = prod.titel?.toLowerCase() || '';

    if (activeFilter === 'Gekaufte Produkte' || activeFilter === 'Gekauft') {
        matchesCategory = isProductPurchased(prod) && parseFloat(prod.preis) > 0;
    } else if (activeFilter === 'Kostenfrei') {
        matchesCategory = parseFloat(prod.preis) === 0;
    } else if (activeFilter === 'Hörbücher' || activeFilter === 'Hörbuch') {
        matchesCategory = catLower.includes('hörbuch') || catLower.includes('hoerbuch') || titleLower.includes('hörbuch') || titleLower.includes('hoerbuch') || titleLower.includes('schmetterling');
    } else if (activeFilter === 'Meditation') {
        matchesCategory = catLower.includes('meditation') || titleLower.includes('meditation') || titleLower.includes('herzöffnung') || titleLower.includes('loslassen');
    } else if (activeFilter === 'Entspannungsübungen') {
        matchesCategory = catLower.includes('entspannung') || titleLower.includes('entspannung') || titleLower.includes('muskelentspannung');
    } else if (activeFilter === 'Selbsthypnose') {
        matchesCategory = catLower.includes('hypnose') || titleLower.includes('hypnose') || titleLower.includes('selbstbewusstsein') || titleLower.includes('fokus') || titleLower.includes('ernährung');
    } else if (activeFilter === 'Hörprobe') {
        matchesCategory = !!prod.hoerprobe_url && prod.hoerprobe_url.trim() !== '';
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

  const categories = [
    'Alle',
    ...(user || purchasedProductsCount > 0 ? ['Gekaufte Produkte'] : []),
    'Hörbücher',
    'Meditation',
    'Selbsthypnose',
    'Entspannungsübungen',
    'Kostenfrei',
    'Hörprobe'
  ];

  const getCategoryBadgeStyle = (katStr: string = '') => {
    const k = katStr.toLowerCase();
    if (k.includes('hörbuch') || k.includes('hoerbuch') || k.includes('schmetterling')) return 'bg-rose-600/90 text-white border border-rose-300/30';
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
    <div className="max-w-5xl mx-auto p-2 pb-4 lg:p-4 lg:pb-6 font-sans bg-[var(--bg-main)]">
      <header className="mb-5 lg:mb-6 text-center relative">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-3 sm:mb-0 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-full shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Zurück</span>
        </Link>
        <h1 className="text-3xl lg:text-4xl font-serif text-[var(--text-main)]">Premium Inhalte</h1>
        <p className="text-[var(--text-muted)] mt-1.5 text-sm italic">Entdecke unsere exklusiven Inhalte für Meditation, Entspannung und Selbsthypnose.</p>
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
          {categories.map(cat => {
            const isGekauft = cat === 'Gekaufte Produkte';
            const isActive = activeFilter === cat;
            const badgeText = isGekauft && purchasedProductsCount > 0 ? ` (${purchasedProductsCount})` : '';

            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? isGekauft
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                      : 'bg-[var(--accent)] text-white shadow-sm' 
                    : isGekauft
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-alt)]'
                }`}
                aria-pressed={isActive}
              >
                {isGekauft && (
                  <CheckCircle2 size={15} className={isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
                )}
                <span>{isGekauft ? `Gekaufte Produkte${badgeText}` : cat}</span>
              </button>
            );
          })}
        </div>

        {/* Status-Banner wenn "Gekaufte Produkte" Filter aktiv ist */}
        {activeFilter === 'Gekaufte Produkte' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>
                Aktiver Filter: <strong>Gekaufte Produkte ({filteredProdukte.length} freigeschaltet)</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={expandAllPurchased}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-700 transition cursor-pointer shadow-xs"
              >
                Alle aufklappen
              </button>
              <button
                onClick={collapseAllPurchased}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-700 transition cursor-pointer shadow-xs"
              >
                Alle zuklappen
              </button>
              <button
                onClick={() => setActiveFilter('Alle')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer ml-1"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Kompakter Bereich für kostenlose Hörproben (oben vor gekauften Produkten) */}
      {(() => {
        const hoerproben = produkte.filter(p => !!p.hoerprobe_url && p.hoerprobe_url.trim() !== '');
        if (hoerproben.length === 0) return null;
        return (
          <div className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[var(--accent)] text-white">
                Kostenlos reinschnuppern
              </span>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[var(--text-main)]">
                Kostenlose Hörproben
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Höre unverbindlich rein – 100 % werbefrei und ohne Anmeldung.
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {hoerproben.map((p) => (
                <HoerprobenPlayer key={p.id} produkt={p} variant="compact" showProductLink={true} onProductClick={handleJumpToProduct} />
              ))}
            </div>
          </div>
        );
      })()}

      {user && (
        <div className="w-full bg-[var(--bg-card)] border border-emerald-300/80 dark:border-emerald-800/80 rounded-2xl overflow-hidden mb-8 shadow-xs">
          <button
            onClick={() => setIsPurchasedMenuOpen(!isPurchasedMenuOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-expanded={isPurchasedMenuOpen}
            aria-label="Meine gekauften Produkte Menü aufklappen oder zuklappen"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text-main)] truncate">
                    Meine gekauften Produkte
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                    {purchasedProductsCount > 0 ? `${purchasedProductsCount} freigeschaltet` : 'Übersicht'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {isPurchasedMenuOpen 
                    ? 'Klicke hier zum Zuklappen des Menüs' 
                    : 'Klicke hier, um deine freigeschalteten Einkäufe aufzuklappen'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-xs sm:text-sm shrink-0 pl-2">
              <span className="hidden sm:inline">{isPurchasedMenuOpen ? 'Menü zuklappen' : 'Menü aufklappen'}</span>
              {isPurchasedMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {isPurchasedMenuOpen && (
            <div className="p-4 sm:p-6 border-t border-emerald-200/60 dark:border-emerald-800/60 bg-[var(--bg-card)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)]">
                  Schnellzugriff auf deine freigeschalteten Inhalte:
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('Gekaufte Produkte');
                    const el = document.getElementById('products-catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                >
                  <span>Nur gekaufte Produkte in der Liste filtern</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {loadingPurchases ? (
                <p className="text-sm text-[var(--text-muted)] animate-pulse">Lade gekaufte Inhalte...</p>
              ) : myPurchases.length === 0 && purchasedProductsCount === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-[var(--text-muted)] mb-2">Du hast noch keine Produkte erworben.</p>
                  <button
                    onClick={() => setActiveFilter('Alle')}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Alle Inhalte im Shop entdecken
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myPurchases.map((purchase) => {
                    const prod = produkte.find(p => p.id === purchase.produkt_id || getPlayStoreProductId(p.id) === purchase.produkt_id);
                    const isAudiobook = (prod?.id && prod.id.includes('schmetterling')) || (prod?.titel && prod.titel.toLowerCase().includes('schmetterling'));
                    return (
                      <div key={purchase.id || purchase.produkt_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)]">
                        <div className="flex items-center gap-3">
                          {prod && (
                            <img 
                              src={getProductCoverImage(prod)} 
                              alt={prod.titel} 
                              className="w-12 h-12 rounded-lg object-cover shrink-0 shadow-xs"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-sm text-[var(--text-main)] leading-snug">{prod?.titel || purchase.produkt_id}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              Kaufdatum: {new Date(purchase.created_at || Date.now()).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center self-end">
                          {isAudiobook ? (
                            <Link
                              to={`/hoerbuch/${prod?.id || purchase.produkt_id}`}
                              className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles size={12} />
                              <span>Hörbuch öffnen</span>
                            </Link>
                          ) : null}
                          <button
                            onClick={() => {
                              if (prod?.id) {
                                setExpandedProducts(prev => new Set(prev).add(prod.id));
                              }
                              const el = document.getElementById(`product-${purchase.produkt_id}`) || document.getElementById(`product-${prod?.id}`);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                window.location.hash = `product-${purchase.produkt_id}`;
                              }
                            }}
                            className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-main)] text-xs font-semibold rounded-lg text-[var(--text-main)] transition-all cursor-pointer"
                          >
                            Details & Player
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}



      <div id="products-catalog-section" className="space-y-6">
        {showUnlockBanner && <UnlockBanner />}
        
        {produkte.length === 0 && !loading && (
          <div className="text-center p-12 border border-[var(--border)] rounded-2xl bg-[var(--bg-card)]">
            <h3 className="text-xl font-medium text-[var(--text-main)] mb-2">Es sind noch keine Produkte verfügbar</h3>
            <p className="text-[var(--text-muted)]">Lade neue Inhalte über dein Supabase Dashboard hoch.</p>
          </div>
        )}

        {/* Leerer Zustand wenn der Filter "Gekaufte Produkte" aktiv ist aber keine da sind */}
        {activeFilter === 'Gekaufte Produkte' && sortedProdukte.length === 0 && !loading && (
          <div className="text-center p-10 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-2xl bg-[var(--bg-card)]">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-3 opacity-80" />
            <h3 className="text-lg font-medium text-[var(--text-main)] mb-1">Keine gekauften Produkte gefunden</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Du hast aktuell noch keine bezahlten Inhalte freigeschaltet.</p>
            <button
              onClick={() => setActiveFilter('Alle')}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-[var(--accent-hover)] transition cursor-pointer"
            >
              Alle Produkte anzeigen
            </button>
          </div>
        )}

        {activeFilter !== 'Hörprobe' && sortedProdukte.map((produkt: any) => {
          const istKostenlos = parseFloat(produkt.preis) === 0;
          const playId = getPlayStoreProductId(produkt.id);
          const hatZugriff = isVip || gekauftIds.has(produkt.id) || gekauftIds.has(playId) || offlineManager.isPurchasedOffline(produkt.id) || istKostenlos;

          const getKIBadgeTitle = (p: any) => {
            const dbHinweis = p.audio_hinweis ? p.audio_hinweis.replace(/^Audio-Hinweis:\s*/i, '') : '';
            const coverNotice = "Bildgestaltung: ✨ KI-Design";
            if (dbHinweis) {
              return `${coverNotice} | Audio: ${dbHinweis} (Klick für KI-Transparenzhinweis)`;
            }
            return `${coverNotice} | Klick für KI-Transparenzhinweis`;
          };

          const isSchmetterling = (produkt.id && produkt.id.includes('schmetterling')) || (produkt.titel && produkt.titel.toLowerCase().includes('schmetterling'));
          const showKIBadge = !isSchmetterling;

          // ─── Eingeklappte Compact-Ansicht für gekaufte Produkte ──────────
          const isExpanded = expandedProducts.has(produkt.id);
          if (hatZugriff && !istKostenlos && !isExpanded) {
            return (
              <div
                key={produkt.id}
                id={`product-${produkt.id}`}
                className="bg-[var(--bg-card)] border border-emerald-300 dark:border-emerald-800 rounded-2xl overflow-hidden transition hover:shadow-md"
              >
                <button
                  onClick={() => toggleProductExpand(produkt.id)}
                  className="w-full flex items-center gap-4 p-3 sm:p-4 text-left group cursor-pointer"
                  aria-expanded={false}
                  aria-label={`${produkt.titel} aufklappen`}
                >
                  {/* Mini-Cover */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={getProductCoverImage(produkt)}
                      alt={produkt.titel}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Titel + Badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={11} />
                        Freigeschaltet
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md uppercase ${getCategoryBadgeStyle(produkt.kategorie)}`}>
                        {produkt.kategorie || 'Kategorie'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-main)] break-words leading-snug">
                      {produkt.titel}
                    </p>
                    <ProductRating
                      produktId={produkt.id}
                      produktTitel={produkt.titel}
                      average={productRatings[produkt.id]?.average}
                      count={productRatings[produkt.id]?.count}
                      variant="summary"
                      className="mt-1"
                    />
                    {produkt.dauer && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">⏱ {formatDuration(produkt.dauer)} Min.</p>
                    )}
                  </div>

                  {/* Aufklappen-Indikator als klarer Button */}
                  <div className="shrink-0 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl group-hover:bg-emerald-100 transition-colors mr-1">
                    <span>Aufklappen</span>
                    <ChevronDown size={16} />
                  </div>
                </button>
              </div>
            );
          }

          return (
            <div key={produkt.id} id={`product-${produkt.id}`} className={`bg-[var(--bg-card)] border ${hatZugriff && !istKostenlos ? 'border-emerald-300 dark:border-emerald-800 shadow-emerald-500/5' : 'border-[var(--border)]'} rounded-2xl overflow-hidden transition hover:shadow-lg`}>
              
              {/* Einklapp-Leiste oben für aufgeklappte gekaufte Produkte */}
              {hatZugriff && !istKostenlos && (
                <button
                  onClick={() => toggleProductExpand(produkt.id)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 cursor-pointer group hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  aria-expanded={true}
                  aria-label={`${produkt.titel} einklappen`}
                >
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-semibold">Freigeschaltet – Einklappen</span>
                  </div>
                  <ChevronUp size={16} className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-800 transition-colors" />
                </button>
              )}

              <div className="p-5 lg:p-7 flex flex-col">

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
                  {produkt.hoerprobe_url && (
                    <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg bg-[var(--accent)] text-white uppercase shadow-md flex items-center gap-1 border border-white/20">
                      🎧 Hörprobe verfügbar
                    </span>
                  )}
                  {hatZugriff && !istKostenlos && (
                    <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg bg-emerald-600 text-white uppercase shadow-md flex items-center gap-1">
                      ✓ Freigeschaltet
                    </span>
                  )}
                </div>
                {showKIBadge && (
                  <a 
                    href="/impressum#ki-transparenz"
                    onClick={(e) => e.stopPropagation()}
                    title={getKIBadgeTitle(produkt)}
                    className="absolute bottom-3 left-3 z-10 text-[10px] font-medium tracking-wide text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15 shadow-sm hover:bg-black/75 hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    🎨 Digital Art
                  </a>
                )}
                {produkt.dauer && (
                  <span className="absolute bottom-3 right-3 text-xs font-semibold text-white/95 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    ⏱ {formatDuration(produkt.dauer)} Min.
                  </span>
                )}
              </div>

              {/* Produktdetails: 2-Spalten für eingeloggtes Kaufen, 1-Spalte Vollbreite für Gäste */}
              <div className={`flex flex-col ${!hatZugriff && user ? 'lg:flex-row' : ''} items-stretch gap-6 lg:gap-10`}>
                
                <div className="flex-1 flex flex-col w-full">
                    <h3 className="text-2xl lg:text-3xl font-semibold text-[var(--text-main)] mb-1 leading-tight">{produkt.titel}</h3>
                    
                    <ProductRating
                      produktId={produkt.id}
                      produktTitel={produkt.titel}
                      average={productRatings[produkt.id]?.average}
                      count={productRatings[produkt.id]?.count}
                      variant="summary"
                      className="mb-3"
                    />
                    {!hatZugriff && !istKostenlos && (
                        <div className="text-[1.5rem] font-bold text-[var(--text-main)] mb-4">
                            {produkt.preis} €
                        </div>
                    )}
                    
                    <p className="text-[var(--text-muted)] text-sm lg:text-base leading-relaxed whitespace-pre-line">{produkt.beschreibung}</p>

                    {produkt.audio_hinweis && (
                      <div className="mt-4 p-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-xs text-[var(--text-muted)] flex items-start gap-3 shadow-2xs">
                        <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-semibold text-[var(--text-main)] block mb-0.5">
                            {istKostenlos ? '🌿 Kostenfreie Anwendung (nach Registrierung sofort freigeschaltet)' : '🌿 Persönlich eingesprochen & eigene Texte'}
                          </span>
                          <span className="whitespace-pre-line leading-relaxed">
                            {istKostenlos 
                              ? (produkt.audio_hinweis.includes('Vollständig') 
                                  ? 'Selbst verfasster Übungstext, vertont zur sanften Beruhigung des Nervensystems. Nach kostenloser Registrierung sofort für dich freigeschaltet.'
                                  : produkt.audio_hinweis.replace(/^Audio-Hinweis:\s*/i, ''))
                              : produkt.audio_hinweis.replace(/^Audio-Hinweis:\s*/i, '')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Kostenlose Hörprobe – mit großzügigem vertikalen Abstand zum Audio-Hinweis */}
                    {produkt.hoerprobe_url && (
                      <div className="mt-6 md:mt-8">
                        <HoerprobenPlayer produkt={produkt} variant="compact" />
                      </div>
                    )}
                </div>

                {/* Checkout-Button Spalte – nur wenn eingeloggt und noch kein Zugriff */}
                {!hatZugriff && user && (
                    <div className="lg:w-[45%] xl:w-[40%] pt-6 mt-2 lg:pt-0 lg:mt-0 border-t lg:border-t-0 lg:border-l border-[var(--border)]">
                        <div className="h-full w-full flex flex-col justify-center items-center lg:pl-8">
                            <div className="w-full max-w-md lg:max-w-[340px] flex flex-col gap-3">
                                {isNativeApp ? (
                                    <GooglePlayCheckoutButton 
                                      produkt={produkt}
                                      user={user}
                                      setShowUnlockBanner={setShowUnlockBanner}
                                      onSuccess={() => handleProductPurchaseSuccess(produkt)}
                                    />
                                ) : (
                                    <PayPalCheckoutButton 
                                      produkt={produkt} 
                                      user={user} 
                                      setShowUnlockBanner={setShowUnlockBanner}
                                      onSuccess={() => handleProductPurchaseSuccess(produkt)} 
                                      paypalClientId={PAYPAL_CLIENT_ID}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
              </div>

              {!hatZugriff && !user && (
                <div className="mt-6 md:mt-8 bg-[var(--bg-card)] border border-[var(--color-accent-primary)]/40 rounded-2xl p-5 sm:p-6 text-[var(--text-main)] shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[var(--accent)]/15 rounded-xl text-[var(--accent)] shrink-0">
                        <Lock size={22} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[var(--text-main)] mb-1">
                          {istKostenlos ? "Kostenloses Audio nach Registrierung anhören" : "Produkt freischalten"}
                        </h4>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                          {istKostenlos 
                            ? "Dieses kostenlose Audio steht nach einer kostenlosen und unverbindlichen Registrierung sofort für dich bereit."
                            : `Melde dich an oder registriere dich kostenlos, um dieses Produkt zum Preis von ${produkt.preis} € freizuschalten.`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                      <Link 
                        to={`/register?redirectTo=${encodeURIComponent('/premium-dashboard#product-' + produkt.id)}`}
                        className="px-4 py-2 bg-[var(--accent)] text-white text-xs sm:text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
                      >
                        Jetzt kostenlos registrieren
                      </Link>
                      <Link 
                        to={`/login?redirectTo=${encodeURIComponent('/premium-dashboard#product-' + produkt.id)}`}
                        className="px-4 py-2 bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] text-xs sm:text-sm font-semibold rounded-xl border border-[var(--border)] transition shadow-sm"
                      >
                        Anmelden
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Für freigeschaltete Produkte: Audio Player Button (auch im Flugmodus sofort verfügbar) */}
              {hatZugriff && (
                <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col gap-4">
                    {(produkt.kategorie?.toLowerCase().includes('hörbuch') || produkt.titel?.toLowerCase().includes('schmetterling') || produkt.titel?.toLowerCase().includes('hörbuch')) ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/hoerbuch/${produkt.id}`}
                          className="flex-1 py-3 px-5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles size={16} />
                          <span>Hörbuch-Player öffnen (58:43 Min &amp; Kapitel)</span>
                        </Link>
                        <AudioPlayerButton 
                          produkt={produkt}  
                          getUrl={async (p: any) => {
                            if (p.audio_path && p.audio_path.startsWith('http')) {
                              return p.audio_path;
                            }
                            const off = getOfflineProductById(p.id);
                            if (off?.audio_path && off.audio_path.startsWith('http')) {
                              return off.audio_path;
                            }
                            try {
                              const supabase = getSupabase();
                              const { data } = await supabase.storage.from('audio-bucket').getPublicUrl(`${p.id}.mp3`);
                              return data?.publicUrl || '';
                            } catch {
                              return '';
                            }
                          }} 
                        />
                      </div>
                    ) : (
                      <AudioPlayerButton 
                        produkt={produkt}  
                        getUrl={async (p: any) => {
                          if (p.audio_path && p.audio_path.startsWith('http')) {
                            return p.audio_path;
                          }
                          const off = getOfflineProductById(p.id);
                          if (off?.audio_path && off.audio_path.startsWith('http')) {
                            return off.audio_path;
                          }
                          try {
                            const supabase = getSupabase();
                            const { data } = await supabase.storage.from('audio-bucket').getPublicUrl(`${p.id}.mp3`);
                            return data?.publicUrl || '';
                          } catch {
                            return '';
                          }
                        }} 
                      />
                    )}

                    {/* Interaktive Sternebewertung für freigeschaltete Hörer */}
                    {user && (
                      <ProductRating
                        produktId={produkt.id}
                        produktTitel={produkt.titel}
                        average={productRatings[produkt.id]?.average}
                        count={productRatings[produkt.id]?.count}
                        variant="interactive"
                        onRatingChanged={(newAvg, newCount) => {
                          setProductRatings(prev => ({
                            ...prev,
                            [produkt.id]: { average: newAvg, count: newCount }
                          }));
                        }}
                      />
                    )}

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
              </div>{/* Ende: innerer p-5/p-7 Container */}
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
  const [toast, setToast] = useState<PurchaseToastData>({
    show: false,
    type: 'cancelled',
    title: '',
    message: ''
  });

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
          const lower = (msg || '').toLowerCase();
          const isCancel = lower.includes('user_canceled') || lower.includes('cancelled') || lower.includes('abgebrochen');
          if (isCancel) {
            setToast({
              show: true,
              type: 'cancelled',
              title: 'Google Play Kauf abgebrochen',
              productTitle: produkt?.titel,
              message: 'Du hast den Bezahlvorgang in Google Play abgebrochen. Es wurde kein Betrag von deinem Google-Konto abgebucht.'
            });
          } else {
            setToast({
              show: true,
              type: 'failed',
              title: 'Google Play Kauf nicht möglich',
              productTitle: produkt?.titel,
              message: 'Der Bezahlvorgang konnte über den Play Store nicht durchgeführt werden. Es wurde kein Geld abgebucht.',
              showSupportLink: true
            });
          }
        }
      });
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Bezahlvorgang konnte nicht gestartet werden.');
      setToast({
        show: true,
        type: 'failed',
        title: 'Google Play Kauf fehlgeschlagen',
        productTitle: produkt?.titel,
        message: err?.message || 'Der Bezahlvorgang konnte nicht gestartet werden. Es wurde kein Geld abgebucht.',
        showSupportLink: true
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 3500);
    }
  };

  const getFriendlyErrorInfo = (rawError: string | null) => {
    if (!rawError) return null;
    const lower = rawError.toLowerCase();

    if (lower.includes('user_canceled') || lower.includes('cancelled') || lower.includes('abgebrochen')) {
      return {
        text: 'Der Kaufvorgang wurde abgebrochen.',
        isInfo: true,
        showSupport: false
      };
    }

    if (lower.includes('already owned') || lower.includes('bereits gekauft') || lower.includes('kauf gefunden')) {
      return {
        text: 'Kauf in Google Play gefunden. Schalte Inhalte frei...',
        isInfo: true,
        showSupport: false
      };
    }

    if (lower.includes('item_unavailable') || lower.includes('not_found') || lower.includes('nicht verfügbar') || lower.includes('nicht gefunden') || lower.includes('unavailable')) {
      return {
        text: 'Dieses Produkt ist derzeit im Google Play Store noch nicht verfügbar oder wird gerade geprüft.',
        isInfo: false,
        showSupport: true
      };
    }

    if (lower.includes('network') || lower.includes('connection') || lower.includes('verbindung')) {
      return {
        text: 'Verbindungsfehler zum Google Play Store. Bitte prüfe deine Internetverbindung.',
        isInfo: false,
        showSupport: false
      };
    }

    return {
      text: rawError,
      isInfo: false,
      showSupport: true
    };
  };

  const errorInfo = getFriendlyErrorInfo(error);

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

      {errorInfo && (
        <div className="w-full mb-3">
          <div className={`w-full text-xs rounded-xl p-3 font-medium text-center border leading-relaxed ${
            errorInfo.isInfo 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800' 
              : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-900'
          }`}>
            {errorInfo.text}
          </div>
          {errorInfo.showSupport && (
            <div className="mt-2 text-center">
              <a
                href={`mailto:hallo@flow-der-stille.de?subject=${encodeURIComponent(`Kundenservice-Anfrage: Produkt "${produkt.titel}"`)}&body=${encodeURIComponent(`Hallo Flow der Stille Team,\n\nich möchte gerne das Produkt "${produkt.titel}" (ID: ${produkt.id}) kaufen, erhalte aber im App Store folgende Rückmeldung:\n${error}\n\nBitte helft mir beim Kauf/Freischalten.`)}`}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline font-semibold pt-1"
              >
                <Mail size={14} />
                <span>Problem melden / Support per E-Mail kontaktieren</span>
              </a>
            </div>
          )}
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

      {/* Floating Purchase Toast Notification */}
      <PurchaseToast 
        toast={toast} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))} 
      />
    </div>
  );
}