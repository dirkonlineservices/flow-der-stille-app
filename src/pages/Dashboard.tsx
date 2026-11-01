import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wind, Sun, Moon, Coffee, CheckCircle, Circle, BookOpen, 
  Send, MessageCircle, Share2, Eye, RefreshCw, ArrowRight,
  Sparkles, Headphones, Check, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import NewsletterBanner from '../components/NewsletterBanner';
import WeeklyChallenge from '../components/WeeklyChallenge';
import SEO from '../components/SEO';
import { getSupabase } from '../lib/supabaseClient';
import { HoerprobenPlayer } from '../components/HoerprobenPlayer';
import { getOfflineProducts, ProductData } from '../lib/offlineProductsService';
import { checkUserIsAdmin } from '../lib/adminSecurity';

const dailyWisdoms = [
  { title: "Tägliche Weisheit", text: "\"Das Nervensystem kennt keinen Unterschied zwischen einem echten Tiger und einem Gedanken-Tiger. Behandle deine Gedanken mit Freundlichkeit.\"" },
  { title: "Tägliche Weisheit", text: "\"Achtsamkeit bedeutet nicht, dass wir unsere Gefühle unterdrücken. Es bedeutet, dass wir ihnen Raum geben, ohne uns von ihnen beherrschen zu lassen.\"" },
  { title: "Tägliche Weisheit", text: "\"In der Stille liegt eine sanfte Kraft. Nimm dir heute einen Moment, um ihr einfach nur zuzuhören.\"" },
  { title: "Tägliche Weisheit", text: "\"Jeder tiefe Atemzug ist ein kleiner Neuanfang. Du kannst jederzeit von vorne beginnen.\"" },
  { title: "Tägliche Weisheit", text: "\"Es gibt nichts zu tun, außer zu sein. Erlaube dir für einen Moment, einfach nur zu existieren.\"" },
  { title: "Tägliche Weisheit", text: "\"Stress ist oft der Versuch des Körpers, gegen die Realität anzukämpfen. Entspannung beginnt mit dem Akzeptieren des Jetzt.\"" },
  { title: "Tägliche Weisheit", text: "\"Dein Atem ist ein Anker im Hier und Jetzt. Wenn die Gedanken rasen, kehre sanft zu ihm zurück.\"" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);
  const initialProducts = getOfflineProducts().filter(p => p.is_active && (p.audio_path || p.hoerprobe_url));
  const [productList, setProductList] = useState<ProductData[]>(initialProducts);
  const [klangprobeFilter, setKlangprobeFilter] = useState<'Alle' | 'Meditation' | 'Selbsthypnose' | 'Hörbuch' | 'Kostenfreie Anwendungen'>('Alle');
  const [showAllKlangproben, setShowAllKlangproben] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shareToast, setShareToast] = useState('');

  // Wenn nicht eingeloggt, zum Login leiten
  useEffect(() => {
    if (!user) {
      navigate('/login?redirectTo=/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Alle Produkte für Klangproben aus Supabase laden
  useEffect(() => {
    Promise.race([
      getSupabase()
        .from('produkte')
        .select('*')
        .eq('is_active', true),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
      .then((res: any) => {
        const data = res?.data;
        if (data && Array.isArray(data) && data.length > 0) {
          const playable = data.filter((p: any) => p.audio_path || p.hoerprobe_url);
          if (playable.length > 0) {
            setProductList(playable);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Admin-Rechte prüfen
  useEffect(() => {
    if (!user) return;
    checkUserIsAdmin(user.id, user.email).then(adminStatus => {
      if (adminStatus) {
        setIsAdmin(true);
      }
    });
  }, [user]);

  // Tagesimpuls berechnen
  const dayOfYear = Math.floor((Date.now() - Number(new Date(new Date().getFullYear(), 0, 0))) / 86400000);
  const todaysWisdom = dailyWisdoms[dayOfYear % dailyWisdoms.length];

  const timeOfDay = new Date().getHours();
  let greetingKey = 'home.greeting.morning';
  if (timeOfDay >= 12 && timeOfDay < 18) greetingKey = 'home.greeting.afternoon';
  if (timeOfDay >= 18) greetingKey = 'home.greeting.evening';

  const getUserName = () => {
    if (!user) return 'Traveler';
    return user.first_name || user.username || 'Traveler';
  };

  const dateStr = new Date().toISOString().split('T')[0];
  const completedKey = `daily_wisdom_${dateStr}`;
  const isCompleted = localCompleted || !!user?.completed_tasks?.includes(completedKey);

  const handleCompleteWisdom = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const currentCompleted = user.completed_tasks || [];
      if (!currentCompleted.includes(completedKey)) {
        const nextCompleted = [...currentCompleted, completedKey];

        const supabase = getSupabase();
        const { data, error } = await supabase.auth.updateUser({
          data: { completed_tasks: nextCompleted }
        });

        if (!error && data?.user) {
          setLocalCompleted(true);
          login({ ...user, completed_tasks: nextCompleted });
        }
      }
    } catch (err) {
      console.error('Failed to save wisdom progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Flow der Stille',
      text: 'Entdecke Flow der Stille: Meditation, Vagusnerv-Entspannung & Achtsamkeit ohne teures Abo.',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        setShareToast('Link in die Zwischenablage kopiert!');
        setTimeout(() => setShareToast(''), 3500);
      } catch {
        setShareToast('Teilen fehlgeschlagen');
        setTimeout(() => setShareToast(''), 2500);
      }
    }
  };

  const handleShareWisdom = async () => {
    // WICHTIG: Die URL wird bewusst NICHT in den Text-String geschrieben,
    // da WhatsApp und Smartphone-Share-Sheets das Feld 'url' automatisch an 'text' anhängen.
    // Wenn die URL auch im text stünde, würde sie sonst doppelt erscheinen!
    const wisdomText = `✨ Tägliche Weisheit von Flow der Stille:\n${todaysWisdom.text}\n\nFinde deine innere Ruhe – Meditation, Achtsamkeit & Vagusnerv-Entspannung:`;
    const shareUrl = 'https://flow-der-stille.de';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tagesimpuls – Flow der Stille',
          text: wisdomText,
          url: shareUrl
        });
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${wisdomText}\n${shareUrl}`);
        setShareToast('Tagesimpuls in die Zwischenablage kopiert! Bereit zum Teilen auf WhatsApp (auch als Status), Instagram, TikTok & Co.');
        setTimeout(() => setShareToast(''), 4500);
      } catch {
        setShareToast('Teilen fehlgeschlagen');
        setTimeout(() => setShareToast(''), 2500);
      }
    }
  };

  const filteredKlangproben = productList.filter(p => {
    if (klangprobeFilter === 'Alle') return true;
    const kat = (p.kategorie || '').toLowerCase();
    if (klangprobeFilter === 'Meditation') return kat.includes('meditation');
    if (klangprobeFilter === 'Selbsthypnose') return kat.includes('hypnose');
    if (klangprobeFilter === 'Hörbuch') return kat.includes('hörbuch') || kat.includes('hoerbuch');
    if (klangprobeFilter === 'Kostenfreie Anwendungen') return kat.includes('kostenfrei') || Number(p.preis) === 0;
    return true;
  });

  // Kompakte Ansicht: Standardmäßig nur die ersten 4 Produkte, aufklappbar für alle weiteren
  const displayedKlangproben = showAllKlangproben ? filteredKlangproben : filteredKlangproben.slice(0, 4);

  if (!user) return null;

  return (
    <>
      <SEO 
        title="Mein Dashboard – Flow der Stille" 
        description="Dein persönlicher Ruhebereich mit täglichen Reflexionen, Ritualen und Wochenübungen." 
      />
      <div className="space-y-8 w-full max-w-4xl lg:max-w-5xl mx-auto">
        {/* Admin-Steuerungsleiste */}
        {isAdmin && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-3.5 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <Eye size={17} className="text-emerald-300 shrink-0" />
              <span><strong>Admin-Modus:</strong> Du bist in deinem persönlichen Dashboard</span>
            </div>
            <Link 
              to="/"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition border border-white/20 cursor-pointer shrink-0"
            >
              <RefreshCw size={14} />
              <span>Öffentliche Startseite anzeigen</span>
            </Link>
          </div>
        )}

        <header className="mb-10 flex flex-col items-center">
          <img src="/logo-transparent.png" alt="Logo" className="h-14 mb-3" />
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-serif text-[var(--color-accent-primary)] mb-2 text-center"
          >
            {t(greetingKey)}, {getUserName()}
          </motion.h1>
          <p className="text-[var(--color-text-muted)] text-base md:text-lg text-center max-w-xl">
            {t('home.subtitle')}
          </p>
          
          {/* Dein Start in den Tag: Tägliche Weisheit & Impuls */}
          <div className="w-full mt-6 p-6 sm:p-7 bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden text-left">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={13} className="text-amber-500" />
                    Dein Start in den Tag
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">• Tägliche Weisheit</span>
                </div>

                {/* Social Share Button */}
                <button 
                  onClick={handleShareWisdom}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-accent-primary)] hover:text-white text-[var(--color-text-main)] border border-[var(--color-border-main)] text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Tagesimpuls auf WhatsApp, Instagram, TikTok & Social Media teilen"
                >
                  <Share2 size={13} />
                  <span>Impuls teilen</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif text-[var(--color-accent-primary)] mb-2">
                {todaysWisdom.title}
              </h2>
              <p className="text-[var(--color-text-muted)] italic text-base sm:text-lg leading-relaxed border-l-2 border-[var(--color-accent-primary)] pl-4">
                {todaysWisdom.text}
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-start md:justify-end">
              <button 
                id="btn-complete-daily-wisdom"
                onClick={handleCompleteWisdom}
                disabled={isCompleted || loading}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default shadow-sm' 
                    : 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white shadow-sm active:scale-95 cursor-pointer'
                }`}
              >
                {isCompleted ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Circle size={16} />}
                <span>
                  {isCompleted 
                    ? 'Inmitten der Stille reflektiert' 
                    : (loading ? 'Speichern...' : 'Als reflektiert markieren')}
                </span>
              </button>
            </div>
          </div>
          
          {/* Schnelleinstieg für den Tag */}
          <div className="bg-[var(--color-bg-card)] p-6 md:p-8 rounded-3xl border border-[var(--color-border-main)] mt-6 w-full text-center shadow-sm">
            <h3 className="text-xl md:text-2xl font-serif text-[var(--color-text-main)] mb-1 font-medium">
              Für kurze Momente der Stille
            </h3>
            <p className="text-[var(--color-text-muted)] text-xs sm:text-sm leading-relaxed mb-5 max-w-md mx-auto">
              Wähle eine Übung passend zu deiner aktuellen Tageszeit:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/morgenritual" className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:border-[var(--color-accent-primary)] hover:shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <Sun size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-main)] group-hover:text-[var(--color-accent-primary)] transition-colors">Für ein kurzes Morgenritual</span>
              </Link>
              
              <Link to="/exercises" className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:border-[var(--color-accent-primary)] hover:shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <Coffee size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-main)] group-hover:text-[var(--color-accent-primary)] transition-colors">In deiner Mittagspause</span>
              </Link>

              <Link to="/evening" className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:border-[var(--color-accent-primary)] hover:shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <Moon size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-main)] group-hover:text-[var(--color-accent-primary)] transition-colors">Abends zum Abschalten</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Wochenaufgabe / Gamification */}
        <div>
          <WeeklyChallenge />

          {/* Premium Teaser */}
          <div className="mt-6">
            <Link to="/premium" className="block p-6 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] dark:hover:border-stone-400 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-accent-primary)] transition-colors mb-1">
                    Premium-Mediathek: Einzeln ab 1,99 €
                  </h3>
                  <p className="text-[var(--color-text-muted)] text-sm sm:text-base leading-relaxed">
                    Entdecke Selbsthypnosen, geführte Meditationen und Klangwelten – ohne monatliches Abo, verfügbar in deinem registrierten Konto.
                  </p>
                </div>
                <ArrowRight size={20} className="text-[var(--color-accent-primary)] shrink-0 hidden sm:block group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Kostenlose Klangproben aller Produkte */}
          <div className="mt-8 p-4 sm:p-6 bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-main)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-main)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-[var(--color-accent-primary)] text-white flex items-center gap-1.5">
                    <Headphones size={13} />
                    Klangproben
                  </span>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--color-text-main)]">
                    Kostenlose Klangproben der Produkte
                  </h3>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  100 % werbefrei – höre direkt 90 Sekunden ohne rechtlichen Disclaimer rein.
                </p>
              </div>
              <Link
                to="/klangproben"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
              >
                <Headphones size={14} />
                <span>In alle Klangproben reinhören →</span>
              </Link>
            </div>

            {/* Filter-Kategorien */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'Alle', label: 'Alle Proben' },
                { id: 'Meditation', label: 'Meditationen' },
                { id: 'Selbsthypnose', label: 'Selbsthypnosen' },
                { id: 'Hörbuch', label: 'Hörbücher' },
                { id: 'Kostenfreie Anwendungen', label: 'Kostenfreie Übungen' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setKlangprobeFilter(cat.id as any);
                    // Beim Kategoriewechsel Ansicht zurücksetzen oder erweitert lassen
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    klangprobeFilter === cat.id
                      ? 'bg-[var(--color-accent-primary)] text-white shadow-xs'
                      : 'bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-main)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid mit kompakten / aufklappbaren Produkten */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {displayedKlangproben.map((p) => (
                <HoerprobenPlayer 
                  key={p.id} 
                  produkt={p} 
                  variant="compact" 
                  showProductLink={true} 
                  onProductClick={(productId) => {
                    const targetId = p.play_store_id || productId;
                    navigate(`/premium#product-${targetId}`);
                  }}
                />
              ))}
            </div>

            {/* Aufklappen-Button / Einklappen-Button */}
            {filteredKlangproben.length > 4 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--color-border-main)]">
                <button
                  type="button"
                  onClick={() => setShowAllKlangproben(!showAllKlangproben)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-main)] text-xs sm:text-sm font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  <ChevronDown className={`transition-transform duration-200 ${showAllKlangproben ? 'rotate-180' : ''}`} size={16} />
                  <span>
                    {showAllKlangproben 
                      ? 'Weniger Klangproben anzeigen (auf 4 reduzieren)' 
                      : `Alle ${filteredKlangproben.length} Klangproben aufklappen (+${filteredKlangproben.length - 4} weitere)`}
                  </span>
                </button>
                
                <Link 
                  to="/klangproben" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent-primary)] hover:underline"
                >
                  <span>Zur großen Mediathek</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Schnellauswahl-Kacheln */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <QuickActionCard 
            title={t('home.card.morning.title')} 
            description={t('home.card.morning.desc')}
            icon={<Sun className="text-amber-500" />}
            to="/morgenritual"
          />
          <QuickActionCard 
            title={t('home.card.breathing.title')} 
            description={t('home.card.breathing.desc')}
            icon={<Wind className="text-blue-400" />}
            to="/exercises"
          />
          <QuickActionCard 
            title={t('home.card.meal.title')} 
            description={t('home.card.meal.desc')}
            icon={<Coffee className="text-emerald-600" />}
            to="/recipes"
          />
          <QuickActionCard 
            title={t('home.card.evening.title')} 
            description={t('home.card.evening.desc')}
            icon={<Moon className="text-indigo-400" />}
            to="/evening"
          />
        </div>

        {/* Newsletter */}
        <div className="mt-8">
          <NewsletterBanner variant="in-content" />
        </div>

        {/* Einheitliche Community & Social Media Bar */}
        <section className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left mt-8">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-[var(--text-main)]">
              Verbinde dich mit unserer Community
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Tägliche Inspirationen &amp; Austausch auf deinen Lieblings-Kanälen
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a 
              href="https://t.me/+ccWPbkn00zs4Zjc6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-main)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--color-accent-primary)]"
              title="Folge uns auf Telegram"
            >
              <Send size={15} className="text-sky-500" />
              <span>Telegram</span>
            </a>

            <a 
              href="https://whatsapp.com/channel/0029VbDGNKFKmCPPBOppWs2M" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-main)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--color-accent-primary)]"
              title="Folge uns auf WhatsApp"
            >
              <MessageCircle size={15} className="text-emerald-500" />
              <span>WhatsApp</span>
            </a>

            <a 
              href="https://www.instagram.com/flowderstille" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-main)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--color-accent-primary)]"
              title="Folge uns auf Instagram"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span>Instagram</span>
            </a>

            <a 
              href="https://www.facebook.com/flowderstille" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-main)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--color-accent-primary)]"
              title="Folge uns auf Facebook"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-600" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>

            <button
              onClick={handleShareApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-xs sm:text-sm font-semibold transition shadow-2xs cursor-pointer active:scale-95"
              title="Flow der Stille mit Freunden teilen"
            >
              <Share2 size={15} />
              <span>Teilen</span>
            </button>
          </div>
        </section>

        {shareToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-stone-900 text-white text-xs sm:text-sm font-medium rounded-xl shadow-lg z-50 animate-fade-in flex items-center gap-2">
            <span>✓ {shareToast}</span>
          </div>
        )}
      </div>
    </>
  );
}

function QuickActionCard({ title, description, icon, to }: { title: string; description: string; icon: React.ReactNode; to: string }) {
  return (
    <Link to={to} className="block group">
      <div className="p-6 bg-[var(--color-bg-card)] rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] dark:hover:border-stone-400 group-active:scale-[0.99] h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-[var(--color-bg-alt)] rounded-xl group-hover:bg-[var(--color-bg-body)] group-hover:scale-110 transition-all">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
          </div>
        </div>
        <h3 className="text-xl font-bold font-serif text-[var(--color-text-main)] mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors">{title}</h3>
        <p className="text-[var(--color-text-muted)] text-sm sm:text-base leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
