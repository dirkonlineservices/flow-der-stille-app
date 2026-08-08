import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wind, Activity, Timer, ArrowRight, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { exercises } from '../data/exercises';
import SEO from '../components/SEO';
import SingleAudioPlayer from '../components/SingleAudioPlayer';

export default function Exercises() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <SEO title="Übungen" description="Achtsamkeitsübungen und Atemtechniken zur Entspannung." />
      <header className="mb-8">
        <h1 className="text-4xl font-serif text-[var(--color-accent-primary)] mb-4">{t('exercises.title')}</h1>
        <p className="text-[var(--color-text-muted)]">
          {t('exercises.subtitle')}
        </p>
      </header>

      <div className="grid gap-6">
        {exercises.map((exercise) => {
          // 1. Typo-Korrektur: "Box-Armung" wird live zu "Box-Atmung"
          const rawTitle = t(exercise.translationKeyTitle);
          const safeTitle = rawTitle.includes('Box-Armung') ? rawTitle.replace('Box-Armung', 'Box-Atmung') : rawTitle;

          // 2. GLOBALER BILD-FALLBACK
          const fallbackImage = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop';
          const finalImage = exercise.image ? exercise.image : fallbackImage;
          const isAudioExercise = !!exercise.audioId;

          return (
            <ExerciseCard 
              key={exercise.id}
              id={exercise.id}
              title={safeTitle}
              category={t(exercise.translationKeyCategory)}
              duration={exercise.duration}
              description={t(exercise.translationKeyDesc)}
              image={finalImage}
              isAudioExercise={isAudioExercise}
            />
          );
        })}
      </div>
    </div>
  );
}

// === KACHEL 2: ALLE ANDEREN ÜBUNGEN ===
function ExerciseCard({ id, title, category, duration, description, image, isAudioExercise }: { id: string; title: string; category: string; duration: string; description: string; image: string; isAudioExercise: boolean }) {
  const { t } = useLanguage();
  return (
    <Link to={`/exercises/${id}`} className="block">
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border-main)] flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all cursor-pointer group min-h-[220px]"
      >
        <div className="w-full md:w-64 h-56 md:h-auto shrink-0 relative bg-stone-100 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
            onError={(e) => { 
              e.currentTarget.src = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop'; 
            }}
          />
          <span onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/impressum#ki-transparenz';
          }} className="absolute bottom-3 right-3 z-10 cursor-pointer">
            <span className="bg-black/40 text-white/90 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md">[KI]</span>
          </span>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-0" />
        </div>
        
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 bg-[var(--color-bg-border)] rounded-md text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                {category}
              </span>
              <div className="flex items-center gap-3">
                {isAudioExercise && (
                  <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md font-medium border border-amber-500/20 flex items-center gap-1">
                    <Lock size={12} /> Kostenlose Registrierung für Audio
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted-light)] font-medium">
                  <Timer size={14} />
                  <span>{duration}</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
              {title}
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4 line-clamp-2">
              {description}
            </p>
          </div>
          
          <div className="mt-auto flex items-center text-[var(--color-accent-primary)] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
            <span>{t('exercise.view')}</span>
            <ArrowRight size={16} className="ml-1.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}