import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, Headphones, Play, Pause, ShieldCheck, 
  Moon, Clock, Volume2, ArrowLeft, CheckCircle2, 
  HelpCircle, Shield, Award, Wind, Smartphone, ChevronDown, ChevronUp,
  Brain, Zap, Lock, Gift, Star, BookOpen, AlertCircle
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { getOfflineProductById, DEFAULT_PRODUCTS } from '../lib/offlineProductsService';
import { getSupabase } from '../lib/supabaseClient';
import { AudioPlayerButton } from '../components/AudioPlayerButton';
import { HoerprobenPlayer } from '../components/HoerprobenPlayer';
import QuickSocialUnlockBox from '../components/QuickSocialUnlockBox';
import AudioDisclaimerNotice from '../components/AudioDisclaimerNotice';
import { offlineManager } from '../lib/offlineAudioService';

export default function AudioSessionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwned, setIsOwned] = useState(false);

  // Produkt-ID flexibel auflösen (z. B. "schlaf", "herzoeffnung", direkte UUID oder Key)
  const resolveProductId = (paramId?: string): string => {
    if (!paramId) return 'selbsthypnose_besser_und_erholsamer_schlaf';
    const lower = paramId.toLowerCase();

    if (lower.includes('schlaf')) return 'selbsthypnose_besser_und_erholsamer_schlaf';
    if (lower.includes('herzoeffnung') || lower.includes('herz')) return 'meditation_zur_herzoeffnung';
    if (lower.includes('pmr') || lower.includes('muskel')) return 'pmr_muskelentspannung';
    if (lower.includes('vertrauen') || lower.includes('selbstbewusstsein')) return 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen';
    if (lower.includes('fokus') || lower.includes('konzentration')) return 'selbsthypnose_fokus&konzentration';
    if (lower.includes('ernaehrung')) return 'selbsthypnose_ernaehrung';
    if (lower.includes('schmetterling')) return 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte';
    if (lower.includes('mensch_sein') || lower.includes('echtsein')) return 'mensch_sein';

    return paramId;
  };

  const resolvedId = resolveProductId(id);

  useEffect(() => {
    async function loadSession() {
      setLoading(true);

      // 1. Zuerst sofort aus Offline-Katalog laden (schnellster First Contentful Paint)
      const offlineProd = getOfflineProductById(resolvedId) || 
                          DEFAULT_PRODUCTS.find(p => p.id === resolvedId || p.id.includes(resolvedId));
      if (offlineProd) {
        setProductData(offlineProd);
      }

      // 2. Kaufstatus aus Offline-Manager prüfen
      const isOfflineOwned = offlineManager.isPurchasedOffline(resolvedId);
      if (isOfflineOwned) {
        setIsOwned(true);
      }

      // 3. Supabase Abfrage
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('produkte')
          .select('*')
          .or(`id.eq.${resolvedId},titel.ilike.%${id}%`)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setProductData(data);

          if (user) {
            const { data: purchaseData } = await supabase
              .from('kaeufe')
              .select('id')
              .eq('user_id', user.id)
              .eq('produkt_id', data.id)
              .maybeSingle();

            const hasPurchased = !!purchaseData || isOfflineOwned;
            setIsOwned(hasPurchased);
            if (hasPurchased) {
              offlineManager.savePurchasedProducts([data.id]);
            }
          }
        }
      } catch (err) {
        console.warn('Fallback auf Offline-Katalog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [resolvedId, id, user]);

  const isFreeProduct = !productData?.preis || Number(productData.preis) === 0;
  const hasFullAccess = isFreeProduct ? !!user : isOwned;

  const title = productData?.titel || 'Selbsthypnose: Tiefer und erholsamer Schlaf';
  const description = productData?.beschreibung || 'Gedankenkarussell abschalten: Gleite durch sanfte Trance-Impulse in eine schwere, wohlige Tiefenentspannung und regenerierenden Schlaf.';
  const category = productData?.kategorie || (resolvedId.includes('meditation') ? 'Meditation' : 'Selbsthypnose');
  const priceDisplay = isFreeProduct ? '100% Kostenfrei' : (productData?.preis ? `${productData.preis} €` : '1,99 €');
  const durationMinutes = Math.floor((productData?.dauer || 774) / 60);

  const getCoverImage = () => {
    if (resolvedId.includes('schlaf')) return '/images/products/cover_schlaf.jpg';
    if (resolvedId.includes('herz')) return '/images/products/cover_herz.jpg';
    if (resolvedId.includes('vertrauen')) return '/images/products/cover_vertrauen.jpg';
    if (resolvedId.includes('fokus')) return '/images/products/cover_fokus.jpg';
    if (resolvedId.includes('ernaehrung')) return '/images/products/cover_ernaehrung.jpg';
    if (resolvedId.includes('pmr')) return '/images/products/cover_pmr.jpg';
    if (productData?.bild_url) return productData.bild_url;
    return '/images/products/cover_schlaf.jpg';
  };

  const coverImage = getCoverImage();

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": ["Product", "AudioObject"],
    "name": title,
    "description": description,
    "image": `https://flow-der-stille.de${coverImage}`,
    "author": {
      "@type": "Person",
      "name": "Jacqueline Schmetzer"
    },
    "readBy": {
      "@type": "Person",
      "name": "Lisa Ragusa"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Flow der Stille",
      "url": "https://flow-der-stille.de"
    },
    "inLanguage": "de-DE",
    "offers": {
      "@type": "Offer",
      "url": `https://flow-der-stille.de/audio/${resolvedId}`,
      "priceCurrency": "EUR",
      "price": isFreeProduct ? "0.00" : (productData?.preis ? `${productData.preis}` : "1.99"),
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 pb-20 px-4 sm:px-6">
      <SEO
        title={`${title} – Kostenlos anhören & freischalten`}
        description={`${description} Gesprochen von Lisa Ragusa. Jetzt bei Flow der Stille anhören.`}
        keywords="kostenlose Selbsthypnose, kostenlose Meditation, tiefer Schlaf, Einschlafhilfe, Entspannung, Lisa Ragusa, Jacqueline Schmetzer"
        schemaJson={schemaJson}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Zurück-Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/premium"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Zurück zur Premium Mediathek</span>
          </Link>

          <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--bg-alt)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            {category} • {durationMinutes} Min.
          </span>
        </div>

        {/* Hero Card im Stil der Hörbuch-Seiten */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-xl flex flex-col md:flex-row gap-7 sm:gap-8 items-center md:items-start">
          {/* Cover Bild */}
          <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl overflow-hidden shadow-xl border-2 border-[var(--border)] shrink-0 relative group">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-md ${isFreeProduct ? 'bg-emerald-700 text-white' : 'bg-[var(--accent)] text-white'}`}>
                {isFreeProduct ? '100% Kostenfrei (Wert: 1,99 €)' : priceDisplay}
              </span>
            </div>
            {hasFullAccess && (
              <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-white bg-emerald-700/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Freigeschaltet</span>
              </span>
            )}
          </div>

          {/* Details & Beschreibung */}
          <div className="space-y-3.5 text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
                <Brain size={14} />
                <span>{category} • {durationMinutes} Minuten</span>
              </span>

              {hasFullAccess ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 size={13} />
                  <span>Vollversion aktiv</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <Lock size={12} />
                  <span>{isFreeProduct ? 'Gratis nach Registrierung (Wert: 1,99 €)' : `Einmalig ${priceDisplay} • Kein Abo`}</span>
                </span>
              )}
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)] leading-tight">
              {title}
            </h1>

            <p className="text-xs text-[var(--text-muted)] font-medium">
              Autorin: <strong className="text-[var(--text-main)]">Jacqueline Schmetzer</strong> • Sprecherin: <strong className="text-[var(--text-main)]">Lisa Ragusa</strong>
            </p>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
              {description}
            </p>

            {/* Audio-Hinweis Box */}
            {productData?.audio_hinweis && (
              <div className="p-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-xs text-[var(--text-muted)] flex items-start gap-2.5 text-left">
                <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {productData.audio_hinweis.replace(/^Audio-Hinweis:\s*/i, '')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. AUDIO PLAYER BEREICH (Schlank, modern & einladend) */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md space-y-5">
          <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
            <h3 className="font-serif font-semibold text-lg text-[var(--text-main)] flex items-center gap-2">
              <Headphones size={18} className="text-[var(--accent)]" />
              <span>{hasFullAccess ? 'Deine Audio-Sitzung' : 'Hörprobe & Freischaltung'}</span>
            </h3>

            {isFreeProduct && user && (
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/25">
                Vollversion freigeschaltet
              </span>
            )}
          </div>

          {/* Haftungsausschluss-Kennzeichnung */}
          <AudioDisclaimerNotice isLoggedIn={!!user} />

          {/* Wenn der Nutzer vollen Zugriff hat: Schlanker AudioPlayerButton */}
          {hasFullAccess ? (
            <div className="pt-2">
              <AudioPlayerButton 
                produkt={productData || { id: resolvedId, titel: title, audio_path: productData?.audio_path }}
                getUrl={async () => productData?.audio_path || ''}
              />
            </div>
          ) : (
            /* Wenn noch kein Vollzugriff: Hörproben-Player mit 25% / 60s Vorschau */
            <div className="space-y-4 pt-1">
              <HoerprobenPlayer 
                produkt={productData || { id: resolvedId, titel: title, audio_path: productData?.audio_path, dauer: productData?.dauer }}
                variant="full"
                autoPlay={searchParams.get('autoplay') === 'true' || searchParams.get('play') === 'true'}
                enableFloatingPlayer={true}
              />

              {/* 1-Klick Quick Unlock Box (Google & Facebook SSO + E-Mail Fallback) */}
              {!user && (
                <div className="pt-3">
                  <QuickSocialUnlockBox
                    produkt={productData || { id: resolvedId, titel: title, preis: productData?.preis, kategorie: category }}
                    returnPath={`/audio/${resolvedId}`}
                    compact={false}
                  />
                </div>
              )}

              {/* Kauf-Button für kostenpflichtige Audios wenn eingeloggt */}
              {user && !isFreeProduct && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)]">
                  <div>
                    <span className="font-bold text-sm block text-[var(--text-main)]">Vollversion freischalten ({priceDisplay})</span>
                    <span className="text-xs text-[var(--text-muted)]">Einmaliger Kauf • Dauerhafter Zugriff im Web &amp; in der Android-App</span>
                  </div>

                  <Link
                    to={`/premium#product-${resolvedId}`}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Gift size={15} />
                    <span>Jetzt für {priceDisplay} kaufen</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. AUSFÜHRLICHE ERKLÄRUNG ZUR NUTZUNG & VORBEREITUNG */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-serif font-semibold text-xl text-[var(--text-main)] flex items-center gap-2">
              <Sparkles size={20} className="text-[var(--accent)]" />
              <span>Anleitung &amp; Empfehlungen zur Nutzung</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              So holst du das Optimum an Entspannung und Tiefenwirkung aus dieser Sitzung heraus:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Schritt 1: Kopfhörer */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2.5 text-[var(--accent)] font-bold text-xs uppercase tracking-wide">
                <Headphones size={16} />
                <span>1. Kopfhörer verwenden</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Unsere Aufnahmen sind in sanftem Stereo mit abgestimmten Klangschwingungen hinterlegt. Kopfhörer schirmen störende Umgebungsgeräusche ab und lassen Lisas Stimme direkt in dein Bewusstsein fließen.
              </p>
            </div>

            {/* Schritt 2: Körperhaltung */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2.5 text-[var(--accent)] font-bold text-xs uppercase tracking-wide">
                <Moon size={16} />
                <span>2. Bequeme Liege- oder Sitzhaltung</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Lege dich am besten flach ins Bett oder auf die Couch. Lockere beengende Kleidung (Gürtel, Kragen) und lasse dein Körpergewicht vollständig in die Unterlage einsinken.
              </p>
            </div>

            {/* Schritt 3: Augen schließen & Atmen */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2.5 text-[var(--accent)] font-bold text-xs uppercase tracking-wide">
                <Wind size={16} />
                <span>3. Augen sanft schließen &amp; Loslassen</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Sobald die Augen geschlossen sind, reduziert das Gehirn Reize um über 80 %. Folge einfach der Stimme. Es gibt nichts richtig oder falsch zu machen – dein Unterbewusstsein nimmt genau das auf, was du jetzt brauchst.
              </p>
            </div>

            {/* Schritt 4: Smartphone & Flugmodus */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2.5 text-[var(--accent)] font-bold text-xs uppercase tracking-wide">
                <Smartphone size={16} />
                <span>4. Flugmodus &amp; Dunkles Display</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Schalte dein Smartphone vor dem Einschlafen in den Flugmodus. In unserer Android-App kannst du das Audio vorab offline speichern und bei gesperrtem, dunklem Display anhören – ganz ohne Strahlung.
              </p>
            </div>
          </div>

          {/* Sicherheitshinweis */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-[var(--text-muted)]">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[var(--text-main)] font-semibold block mb-0.5">Wichtiger Sicherheitshinweis:</strong>
              Selbsthypnose und Tiefenentspannung führen zu veränderter Aufmerksamkeit. Höre diese Audio-Sessions niemals beim Führen eines Kraftfahrzeugs, beim Fahrradfahren oder beim Bedienen von Maschinen.
            </div>
          </div>
        </div>

        {/* 4. APP DOWNLOAD BANNER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-[var(--bg-alt)] to-[var(--bg-card)] border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <Smartphone size={13} />
              <span>Offline-Hören im Flugmodus</span>
            </div>
            <h4 className="font-serif font-bold text-xl text-[var(--text-main)]">
              Hol dir die Flow der Stille Android-App
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg">
              Speichere diese Session mit einem Klick in der App, schalte nachts den Flugmodus ein und lausche ohne störendes Display oder Strahlung am Bett.
            </p>
          </div>

          <a
            href="https://play.google.com/store/apps/details?id=app.flowderstille.de"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Im Google Play Store laden</span>
            <ArrowLeft size={14} className="rotate-180" />
          </a>
        </div>
      </div>
    </div>
  );
}
