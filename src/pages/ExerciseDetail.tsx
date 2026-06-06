import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Timer, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { exercises } from '../data/exercises';

export default function ExerciseDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const exercise = exercises.find(e => e.id === id);

  if (!exercise) {
    return <div className="p-8 text-center text-stone-500">{t('exercise.notfound')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link to="/exercises" className="inline-flex items-center gap-2 text-stone-500 hover:text-[var(--color-accent-olive)] mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>{t('exercise.back')}</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
      >
        <div className="relative h-64 md:h-80">
          <img 
            src={exercise.image} 
            alt={t(exercise.translationKeyTitle)} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full mb-3 uppercase tracking-wider">
                {t(exercise.translationKeyCategory)}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">
                {t(exercise.translationKeyTitle)}
              </h1>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Timer size={16} />
                <span>{exercise.duration}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            {t(exercise.translationKeyDesc)}
          </p>

          <h2 className="text-xl font-serif text-[var(--color-accent-olive)] mb-6">{t('exercise.instructions')}</h2>
          
          <div className="space-y-6">
            {exercise.instructionKeys.map((key, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-warm)] text-[var(--color-accent-olive)] font-medium flex items-center justify-center shrink-0 border border-[var(--color-accent-olive)]/20">
                  {index + 1}
                </div>
                <p className="text-stone-600 leading-relaxed pt-1">
                  {t(key)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-[var(--color-bg-warm)] rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-medium text-stone-800 mb-1">{t('exercise.ready')}</h3>
              <p className="text-sm text-stone-500">{t('exercise.begin')}</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-[var(--color-accent-olive)] text-white flex items-center justify-center hover:bg-[var(--color-accent-olive-hover)] transition-colors shadow-md">
              <Play size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
