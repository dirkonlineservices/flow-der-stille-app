import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wind, Activity, Timer, ArrowRight, Play, Pause } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { exercises } from '../data/exercises';
import SEO from '../components/SEO';

function AudioPlayButton({ src, title }: { src: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border-main)] flex items-center justify-between">
      <div>
        <h3 className="text-lg font-serif text-[var(--color-text-main)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Audio-Anleitung anhören</p>
      </div>
      <button 
        onClick={togglePlay}
        className="p-3 bg-[var(--color-accent-primary)] text-white rounded-full hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}

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

      <AudioPlayButton src="/Anleitung atmen.wav" title="Geführte Atemübung" />

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
        className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border-main)] flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
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
            <span className="text-xs px-2 py-1 bg-[var(--color-bg-border)] rounded-full text-[var(--color-text-muted)] uppercase tracking-wider font-medium">{category}</span>
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted-light)]">
              <Timer size={12} />
              <span>{duration}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors">{title}</h3>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>
          
          <div className="mt-auto flex items-center text-[var(--color-accent-primary)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            <span>{t('exercise.view')}</span>
            <ArrowRight size={16} className="ml-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

