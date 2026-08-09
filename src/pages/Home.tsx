import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wind, Sun, Moon, Coffee, CheckCircle, Circle, BookOpen, Utensils, Send, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import NewsletterBanner from '../components/NewsletterBanner';
import WeeklyChallenge from '../components/WeeklyChallenge';
import HomeChatWidget from '../components/HomeChatWidget';
import { FriendInviteWidget } from '../components/FriendInviteWidget';
import SEO from '../components/SEO';
import { AuthLink } from '../components/CookieBanner';
import { getSupabase } from '../lib/supabaseClient';

const dailyWisdoms = [
  { title: "Tägliche Weisheit", text: "\"Das Nervensystem kennt keinen Unterschied zwischen einem echten Tiger und einem Gedanken-Tiger. Behandle deine Gedanken mit Freundlichkeit.\"" },
  { title: "Tägliche Weisheit", text: "\"Achtsamkeit bedeutet nicht, dass wir unsere Gefühle unterdrücken. Es bedeutet, dass wir ihnen Raum geben, ohne uns von ihnen beherrschen zu lassen.\"" },
  { title: "Tägliche Weisheit", text: "\"In der Stille liegt eine sanfte Kraft. Nimm dir heute einen Moment, um ihr einfach nur zuzuhören.\"" },
  { title: "Tägliche Weisheit", text: "\"Jeder tiefe Atemzug ist ein kleiner Neuanfang. Du kannst jederzeit von vorne beginnen.\"" },
  { title: "Tägliche Weisheit", text: "\"Es gibt nichts zu tun, außer zu sein. Erlaube dir für einen Moment, einfach nur zu existieren.\"" },
  { title: "Tägliche Weisheit", text: "\"Stress ist oft der Versuch des Körpers, gegen die Realität anzukämpfen. Entspannung beginnt mit dem Akzeptieren des Jetzt.\"" },
  { title: "Tägliche Weisheit", text: "\"Dein Atem ist ein Anker im Hier und Jetzt. Wenn die Gedanken rasen, kehre sanft zu ihm zurück.\"" },
];

export function GooglePlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.45 1.45 0 01-.61-1.186V3a1.45 1.45 0 01.609-1.186z" fill="#4285F4"/>
      <path d="M17.062 8.73L13.792 12l3.27 3.27 3.659-2.091c.712-.407.712-1.951 0-2.358l-3.659-2.091z" fill="#FBBC04"/>
      <path d="M3.609 1.814l10.183 10.186L17.062 8.73 6.136 2.486c-.752-.43-1.748-.288-2.527.328z" fill="#EA4335"/>
      <path d="M3.609 22.186l2.527.328 10.926-6.244-3.27-3.27L3.609 22.186z" fill="#34A853"/>
    </svg>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);
  const isNativeApp = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.() || (window as any).CdvPurchase);

  // Calculate daily wisdom index
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

  // Date formatted key for daily wisdom: daily_wisdom_YYYY-MM-DD
  const dateStr = new Date().toISOString().split('T')[0];
  const completedKey = `daily_wisdom_${dateStr}`;

  // Check if user has already marked this wisdom as completed
  const isCompleted = localCompleted || !!user?.completed_tasks?.includes(completedKey);

  const handleCompleteWisdom = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const currentCompleted = user.completed_tasks || [];
      if (!currentCompleted.includes(completedKey)) {
        const nextCompleted = [...currentCompleted, completedKey];

        // Save progress securely to Supabase user_metadata
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.updateUser({
          data: {
            completed_tasks: nextCompleted
          }
        });

        if (!error && data?.user) {
          setLocalCompleted(true);
          // Sync AuthContext immediately
          login({
            ...user,
            completed_tasks: nextCompleted
          });
        } else if (error) {
          console.error('Error updating user metadata in database:', error.message);
        }
      }
    } catch (err) {
      console.error('Failed to save wisdom progress:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Persönlicher Ruhebereich" 
        description="Finde innere Ruhe bei Flow der Stille. Dein persönlicher Bereich für Achtsamkeit, Stressabbau und tägliche Impulse." 
      />
      <div className="space-y-8">
        <header className="mb-12 flex flex-col items-center">
          <img src="/logo-transparent.png" alt="Logo" className="h-16 mb-4" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-light text-[var(--color-accent-primary)] mb-4 text-center"
          >
            {t(greetingKey)}, {getUserName()}
          </motion.h1>
          <p className="text-[var(--color-text-muted)] text-lg font-light mb-4 text-center">
            {t('home.subtitle')}
          </p>
          
          <div className="bg-[var(--color-bg-card)] p-6 md:p-8 rounded-3xl border border-[var(--color-border-main)] mt-8 max-w-4xl mx-auto w-full text-center shadow-sm">
            <h3 className="text-2xl font-serif text-[var(--color-text-main)] mb-2 font-medium">Für kurze Momente der Stille</h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Unsere Übungen sind perfekt für deinen Alltag konzipiert:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:border-[var(--color-accent-primary)]/40">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Sun size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-main)]">Für ein kurzes Morgenritual</span>
              </div>
              
              <div className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:border-[var(--color-accent-primary)]/40">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Coffee size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-main)]">In deiner Mittagspause</span>
              </div>

              <div className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:border-[var(--color-accent-primary)]/40">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Moon size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-main)]">Abends zum Abschalten</span>
              </div>
            </div>
          </div>
          
          {!user && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-bg-alt)] p-6 rounded-2xl border border-[var(--color-border-main)] flex flex-col md:flex-row gap-6 items-center justify-between mt-8"
            >
              <div className="flex-1">
                <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-2">Willkommen bei Flow der Stille</h3>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                  Die Anmeldung ist kostenlos und unverbindlich. Um deine Fortschritte dauerhaft zu speichern und Zugriff auf wöchentliche Impulse sowie weitere Premium-Funktionen zu erhalten, benötigst du einen Login. Dort findest du mehr.
                </p>
              </div>
              <div className="shrink-0 flex gap-3 w-full md:w-auto">
                <AuthLink to="/login" className="flex-1 md:flex-none flex items-center justify-center text-center px-6 py-2.5 bg-[var(--color-bg-card)] text-[var(--color-text-main)] text-sm font-medium rounded-full border border-[var(--color-border-main)] hover:bg-[var(--color-bg-alt)] transition-colors shadow-sm">
                  Anmelden
                </AuthLink>
                <AuthLink to="/register" className="flex-1 md:flex-none flex items-center justify-center text-center px-6 py-2.5 bg-[var(--color-accent-primary)] text-white text-sm font-medium rounded-full hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm">
                  Kostenlos registrieren
                </AuthLink>
              </div>
            </motion.div>
          )}
        </header>

        <div>
          <WeeklyChallenge />
          
          <div className="mt-12">
            <NewsletterBanner variant="prominent" />
          </div>

          <div className="mt-6">
             <Link to="/premium" className="block p-6 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] hover:shadow-md transition">
                <h3 className="font-bold text-[var(--color-text-main)]">Premium-Bereich: Übungen & Meditationen</h3>
                <p className="text-[var(--color-text-muted)] text-sm">Entdecke exklusive Premium-Inhalte wie Meditationen, Entspannungsübungen und Selbsthypnosen.</p>
             </Link>
          </div>

          <div className="mt-6">
            <FriendInviteWidget />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard 
            title={t('home.card.morning.title')} 
            description={t('home.card.morning.desc')}
            icon={<Sun className="text-amber-500" />}
            delay={0.1}
            to="/exercises"
          />
          <QuickActionCard 
            title={t('home.card.breathing.title')} 
            description={t('home.card.breathing.desc')}
            icon={<Wind className="text-blue-400" />}
            delay={0.2}
            to="/exercises"
          />
          <QuickActionCard 
            title={t('home.card.meal.title')} 
            description={t('home.card.meal.desc')}
            icon={<Coffee className="text-emerald-600" />}
            delay={0.3}
            to="/recipes"
          />
          <QuickActionCard 
            title={t('home.card.evening.title')} 
            description={t('home.card.evening.desc')}
            icon={<Moon className="text-indigo-400" />}
            delay={0.4}
            to="/evening"
          />
        </div>

        {/* Wochenempfehlung (Nur nicht-eingeloggt) */}
        {!user && (
          <section className="mt-12 p-8 bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="flex-1 space-y-4 relative z-10">
              <div className="inline-block px-3 py-1 bg-[var(--color-accent-primary)] text-white text-xs font-bold uppercase tracking-widest rounded-full">
                Empfehlung der Woche
              </div>
              <h2 className="text-3xl font-serif text-[var(--color-text-main)]">Matcha-Linsen-Dal mit Kokosmilch</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Entdecke unser wöchentliches Rezept, das speziell dafür entwickelt wurde, deinen Parasympathikus zu unterstützen. Ein wärmendes, erdendes Dal voller B-Vitamine.
              </p>
              <Link to="/recipe/lentils" className="inline-flex px-6 py-3 bg-[var(--color-accent-primary)] text-white rounded-full font-medium hover:bg-[var(--color-accent-hover)] transition-all">
                Zum Rezept
              </Link>
            </div>
            <div className="w-full md:w-1/3 h-48 bg-[var(--color-bg-alt)] rounded-2xl flex items-center justify-center shrink-0 text-[var(--color-text-muted-light)]">
               <Utensils size={48} />
            </div>
          </section>
        )}


        <section className="mt-12 p-8 bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-[var(--color-accent-primary)]" />
              <h2 className="text-2xl font-serif text-[var(--color-accent-primary)]">{todaysWisdom.title}</h2>
            </div>
            <p className="text-[var(--color-text-muted)] italic text-lg leading-relaxed max-w-2xl">
              {todaysWisdom.text}
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            {user ? (
              <button 
                id="btn-complete-daily-wisdom"
                onClick={handleCompleteWisdom}
                disabled={isCompleted || loading}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                  isCompleted 
                    ? 'bg-emerald-55 border border-emerald-100 text-emerald-800 bg-emerald-50 cursor-default shadow-sm' 
                    : 'bg-[var(--color-bg-body)] hover:bg-stone-150 text-[var(--color-text-main)] border border-[var(--color-border-main)] shadow-sm active:scale-95'
                }`}
              >
                {isCompleted ? <CheckCircle size={16} className="text-emerald-600" /> : <Circle size={16} className="text-[var(--color-text-muted-light)]" />}
                {isCompleted 
                  ? (language === 'de' ? 'Inmitten der Stille reflektiert' : 'Wisdom Reflected') 
                  : (loading ? '...' : (language === 'de' ? 'Als reflektiert markieren' : 'Mark as Reflected'))}
              </button>
            ) : (
              <p className="text-xs text-[var(--color-text-muted-light)] italic">
                {language === 'de' ? 'Melde dich an, um die heutige Weisheit zu reflektieren.' : 'Log in to reflect on today\'s wisdom.'}
              </p>
            )}
          </div>
        </section>

        <section className="mt-8 mb-4 text-center flex flex-wrap justify-center items-center gap-4">
          {!isNativeApp && (
            <a 
              href="https://play.google.com/store/apps/details?id=app.flowderstille.de&pcampaignid=web_share" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white font-semibold transition-all active:scale-95 shadow-md text-sm"
            >
              <GooglePlayIcon className="w-5 h-5 shrink-0" />
              <span>JETZT BEI Google Play</span>
            </a>
          )}

          <a 
            href="https://t.me/+figVxVO_tkw4MGJi" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold transition-all hover:bg-[var(--color-accent-primary)] hover:text-white active:scale-95 shadow-sm text-sm"
          >
            <Send size={18} />
            <span>Folge uns auf Telegram</span>
          </a>
        </section>
      </div>
    </>
  );
}

function QuickActionCard({ title, description, icon, delay, to }: { title: string; description: string; icon: React.ReactNode; delay: number; to: string }) {
  return (
    <Link to={to} className="block group">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="p-6 bg-[var(--color-bg-card)] rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-[var(--color-border-main)] h-full"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-[var(--color-bg-alt)] rounded-xl group-hover:bg-[var(--color-bg-body)] transition-colors">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
          </div>
        </div>
        <h3 className="text-xl font-medium text-[var(--color-text-main)] mb-2 font-sans group-hover:text-[var(--color-accent-primary)] transition-colors">{title}</h3>
        <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{description}</p>
      </motion.div>
    </Link>
  );
}
