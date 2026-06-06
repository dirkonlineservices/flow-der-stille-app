import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, Play, Pause, X, Check, SkipForward, ArrowLeft as BackIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { exercises } from '../data/exercises';
import { supabase } from '../supabase';

export default function ExerciseDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { user, login } = useAuth();
  const exercise = exercises.find(e => e.id === id);

  // Guided Session State
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 15s per instruction step
  const [isPaused, setIsPaused] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused && !showCelebration) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next step
            if (exercise && currentStepIndex < exercise.instructionKeys.length - 1) {
              setCurrentStepIndex((curr) => curr + 1);
              return 15; // Reset step duration
            } else {
              // End of exercise
              clearInterval(timerRef.current!);
              setShowCelebration(true);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, currentStepIndex, showCelebration, exercise]);

  if (!exercise) {
    return <div className="p-8 text-center text-stone-500">{t('exercise.notfound')}</div>;
  }

  const handleStart = () => {
    setCurrentStepIndex(0);
    setTimeLeft(15);
    setIsPaused(false);
    setShowCelebration(false);
    setProgressSaved(false);
    setIsActive(true);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleSkip = () => {
    if (currentStepIndex < exercise.instructionKeys.length - 1) {
      setCurrentStepIndex((curr) => curr + 1);
      setTimeLeft(15);
    } else {
      setShowCelebration(true);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((curr) => curr - 1);
      setTimeLeft(15);
    }
  };

  const handleExit = () => {
    setIsActive(false);
    setShowCelebration(false);
  };

  const handleSaveProgress = async () => {
    if (!user) return;
    setSavingProgress(true);

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const completedKey = `exercise_${exercise.id}_${dateStr}`;
      const currentCompleted = user.completed_tasks || [];

      if (!currentCompleted.includes(completedKey)) {
        const nextCompleted = [...currentCompleted, completedKey];

        const { data, error } = await supabase.auth.updateUser({
          data: {
            completed_tasks: nextCompleted
          }
        });

        if (!error && data?.user) {
          setProgressSaved(true);
          // Manually update the Auth provider status immediately
          login({
            ...user,
            completed_tasks: nextCompleted
          });
        } else if (error) {
          console.error('Error saving exercise completion to Supabase:', error.message);
        }
      } else {
        // Already logged but let's give the user visual feedback
        setProgressSaved(true);
      }
    } catch (err) {
      console.error('An unexpected error occurred saving progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* 1. Guided Player View overlay / fullscreen panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            id="interactive-exercise-player"
            className="fixed inset-0 z-50 bg-[#FAF9F5] p-6 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between max-w-2xl mx-auto w-full pt-4">
              <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">
                {t(exercise.translationKeyCategory)} • {t(exercise.translationKeyTitle)}
              </span>
              <button 
                id="btn-exit-exercise"
                onClick={handleExit}
                className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Interactive Stage */}
            <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center px-4">
              {!showCelebration ? (
                <>
                  {/* Soothing Breathing / Tension Pulsing Circle */}
                  <motion.div 
                    animate={{
                      scale: isPaused ? 1 : [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-48 h-48 rounded-full bg-[var(--color-accent-olive)]/5 flex flex-col items-center justify-center relative mb-12 border border-[var(--color-accent-olive)]/10"
                  >
                    {/* Inner glowing core */}
                    <div className="absolute inset-4 rounded-full bg-stone-100 flex flex-col items-center justify-center">
                      <span className="text-4xl font-serif text-[var(--color-accent-olive)] font-light">
                        {timeLeft}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono tracking-wider uppercase mt-1">sekunden</span>
                    </div>
                  </motion.div>

                  {/* Step content */}
                  <div className="min-h-40 flex flex-col justify-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-olive)] mb-3">
                      Schritt {currentStepIndex + 1} von {exercise.instructionKeys.length}
                    </span>
                    <motion.p 
                      key={currentStepIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-serif text-stone-800 leading-relaxed max-w-xl"
                    >
                      {t(exercise.instructionKeys[currentStepIndex])}
                    </motion.p>
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
                    <Check size={32} />
                  </div>
                  <h2 className="text-3xl font-serif text-stone-800">
                    {language === 'de' ? 'Glückwunsch zum Abschluss!' : 'Session Completed!'}
                  </h2>
                  <p className="text-stone-500 max-w-md mx-auto">
                    {language === 'de' 
                      ? 'Dein Geist und dein Nervensystem haben dieses kurze Innehalten dankbar aufgenommen.' 
                      : 'Your nervous system appreciates this moment of peaceful presence.'}
                  </p>

                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {user ? (
                      <button 
                        id="btn-save-exercise-progress"
                        onClick={handleSaveProgress}
                        disabled={savingProgress || progressSaved}
                        className={`px-6 py-3 rounded-full font-medium text-sm transition-all shadow-sm ${
                          progressSaved 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 cursor-default' 
                            : 'bg-[var(--color-accent-olive)] text-white hover:bg-[var(--color-accent-olive-hover)] active:scale-95'
                        }`}
                      >
                        {progressSaved 
                          ? (language === 'de' ? 'Erfolgreich im Profil geloggt ✓' : 'Progress Saved ✓') 
                          : (savingProgress ? '...' : (language === 'de' ? 'Aktivität ins Journal eintragen' : 'Log to Mindfulness Progress'))}
                      </button>
                    ) : (
                      <p className="text-xs text-stone-400 italic">
                        {language === 'de' ? 'Melde dich an, um diese Übung dauerhaft zu loggen.' : 'Log in to save this exercise to your journal.'}
                      </p>
                    )}

                    <button 
                      onClick={handleExit}
                      className="px-6 py-3 rounded-full border border-stone-200 hover:bg-stone-50 text-sm font-medium text-stone-600 transition-colors"
                    >
                      {language === 'de' ? 'Schließen' : 'Close'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Step Controls Footer */}
            {!showCelebration && (
              <div className="max-w-md mx-auto w-full pb-8 flex items-center justify-between gap-6 px-4">
                <button 
                  id="btn-exercise-prev"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className="px-4 py-2 hover:bg-stone-100 rounded-full text-sm font-medium text-stone-500 disabled:opacity-30 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Zurück</span>
                </button>

                <button 
                  id="btn-exercise-play-pause"
                  onClick={handlePauseToggle}
                  className="w-14 h-14 rounded-full bg-[var(--color-accent-olive)] text-white hover:bg-[var(--color-accent-olive-hover)] active:scale-95 flex items-center justify-center shadow-md transition-all"
                >
                  {isPaused ? <Play size={24} className="ml-0.5" /> : <Pause size={24} />}
                </button>

                <button 
                  id="btn-exercise-next"
                  onClick={handleSkip}
                  className="px-4 py-2 hover:bg-stone-100 rounded-full text-sm font-medium text-stone-500 flex items-center gap-1 transition-colors"
                >
                  <span>Überspringen</span>
                  <SkipForward size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Standard Static Details Page View */}
      <Link to="/exercises" className="inline-flex items-center gap-2 text-stone-500 hover:text-[var(--color-accent-olive)] mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>{t('exercise.back')}</span>
      </Link>

      <motion.div 
        id="static-exercise-detail-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
      >
        <div className="relative h-64 md:h-80">
          <img 
            src={exercise.image || 'https://picsum.photos/seed/gentle/800/600'} 
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

          <div className="mt-12 p-6 bg-[var(--color-bg-warm)] rounded-2xl flex items-center justify-between border border-stone-100">
            <div>
              <h3 className="font-medium text-stone-800 mb-1">{t('exercise.ready')}</h3>
              <p className="text-sm text-stone-500">{t('exercise.begin')}</p>
            </div>
            <button 
              id="btn-play-exercise"
              onClick={handleStart}
              className="w-12 h-12 rounded-full bg-[var(--color-accent-olive)] text-white flex items-center justify-center hover:bg-[var(--color-accent-olive-hover)] transition-all shadow-md active:scale-95"
            >
              <Play size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
