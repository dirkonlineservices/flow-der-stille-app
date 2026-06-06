import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wind, Activity, Timer, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { exercises } from '../data/exercises';

export default function Exercises() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-serif text-[var(--color-accent-olive)] mb-4">{t('exercises.title')}</h1>
        <p className="text-stone-500">
          {t('exercises.subtitle')}
        </p>
      </header>

      <div className="grid gap-6">
        {exercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id}
            id={exercise.id}
            title={t(exercise.translationKeyTitle)}
            category={t(exercise.translationKeyCategory)}
            duration={exercise.duration}
            description={t(exercise.translationKeyDesc)}
            image={exercise.image}
            icon={<Wind className="text-blue-400" />} // Default icon, can be dynamic
          />
        ))}
      </div>
    </div>
  );
}

function ExerciseCard({ id, title, category, duration, description, icon, image }: { id: string; title: string; category: string; duration: string; description: string; icon: React.ReactNode; image: string }) {
  const { t } = useLanguage();
  return (
    <Link to={`/exercises/${id}`}>
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
        
        <div className="p-6 flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs px-2 py-1 bg-stone-100 rounded-full text-stone-500 uppercase tracking-wider font-medium">{category}</span>
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <Timer size={12} />
              <span>{duration}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-serif text-stone-800 mb-2 group-hover:text-[var(--color-accent-olive)] transition-colors">{title}</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>
          
          <div className="mt-auto flex items-center text-[var(--color-accent-olive)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            <span>{t('exercise.view')}</span>
            <ArrowRight size={16} className="ml-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

