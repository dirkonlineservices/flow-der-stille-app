import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wind, Sun, Moon, Coffee, CheckCircle, Circle, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import WeeklyChallenge from '../components/WeeklyChallenge';
import SEO from '../components/SEO';
import { supabase } from '../supabase';

export default function Home() {
  const { t, language } = useLanguage();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);

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
        description="Finden Sie innere Ruhe bei Flow der Stille. Ihr persönlicher Bereich für Achtsamkeit, Stressabbau und tägliche Impulse." 
      />
      <div className="space-y-8">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-light text-[var(--color-accent-olive)] mb-2"
          >
            {t(greetingKey)}, {getUserName()}.
          </motion.h1>
          <p className="text-stone-500 text-lg font-light">
            {t('home.subtitle')}
          </p>
        </header>

        <div className="max-w-3xl">
          <WeeklyChallenge />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard 
            title={t('home.card.morning.title')} 
            description={t('home.card.morning.desc')}
            icon={<Sun className="text-amber-500" />}
            delay={0.1}
          />
          <QuickActionCard 
            title={t('home.card.breathing.title')} 
            description={t('home.card.breathing.desc')}
            icon={<Wind className="text-blue-400" />}
            delay={0.2}
          />
          <QuickActionCard 
            title={t('home.card.meal.title')} 
            description={t('home.card.meal.desc')}
            icon={<Coffee className="text-emerald-600" />}
            delay={0.3}
          />
          <QuickActionCard 
            title={t('home.card.evening.title')} 
            description={t('home.card.evening.desc')}
            icon={<Moon className="text-indigo-400" />}
            delay={0.4}
          />
        </div>

        <section className="mt-12 p-8 bg-white rounded-3xl shadow-sm border border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-[var(--color-accent-olive)]" />
              <h2 className="text-2xl font-serif text-[var(--color-accent-olive)]">{t('home.wisdom.title')}</h2>
            </div>
            <p className="text-stone-600 italic text-lg leading-relaxed max-w-2xl">
              {t('home.wisdom.text')}
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
                    : 'bg-[var(--color-bg-warm)] hover:bg-stone-150 text-stone-700 border border-stone-200 shadow-sm active:scale-95'
                }`}
              >
                {isCompleted ? <CheckCircle size={16} className="text-emerald-600" /> : <Circle size={16} className="text-stone-400" />}
                {isCompleted 
                  ? (language === 'de' ? 'Inmitten der Stille reflektiert' : 'Wisdom Reflected') 
                  : (loading ? '...' : (language === 'de' ? 'Als reflektiert markieren' : 'Mark as Reflected'))}
              </button>
            ) : (
              <p className="text-xs text-stone-400 italic">
                {language === 'de' ? 'Melde dich an, um die heutige Weisheit zu reflektieren.' : 'Log in to reflect on today\'s wisdom.'}
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function QuickActionCard({ title, description, icon, delay }: { title: string; description: string; icon: React.ReactNode; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-stone-50 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-[var(--color-bg-warm)] transition-colors">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
        </div>
      </div>
      <h3 className="text-xl font-medium text-stone-800 mb-2 font-sans">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
