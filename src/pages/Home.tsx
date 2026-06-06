import React from 'react';
import { motion } from 'motion/react';
import { Wind, Sun, Moon, Coffee } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import WeeklyChallenge from '../components/WeeklyChallenge';

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const timeOfDay = new Date().getHours();
  let greetingKey = 'home.greeting.morning';
  if (timeOfDay >= 12 && timeOfDay < 18) greetingKey = 'home.greeting.afternoon';
  if (timeOfDay >= 18) greetingKey = 'home.greeting.evening';

  const getUserName = () => {
    if (!user) return 'Traveler';
    return user.first_name || user.username || 'Traveler';
  };

  return (
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

      <WeeklyChallenge />

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

      <section className="mt-12 p-8 bg-white rounded-3xl shadow-sm border border-stone-100">
        <h2 className="text-2xl font-serif text-[var(--color-accent-olive)] mb-4">{t('home.wisdom.title')}</h2>
        <p className="text-stone-600 italic text-lg leading-relaxed">
          {t('home.wisdom.text')}
        </p>
      </section>
    </div>
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

