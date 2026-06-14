import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, Play, Pause, X, Check, SkipForward, ArrowLeft as BackIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { exercises } from '../data/exercises';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';

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
  const currentStepIndexRef = useRef(currentStepIndex);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    if (isActive && !isPaused && !showCelebration) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const nextIndex = currentStepIndexRef.current + 1;
            // Move to next step
            if (exercise && nextIndex < exercise.instructionKeys.length) {
              setCurrentStepIndex(nextIndex);
              
              // Dynamic duration logic
              if (exercise.pattern) {
                return exercise.pattern[nextIndex].duration;
              }
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
  }, [isActive, isPaused, showCelebration, exercise]);

  if (!exercise) {
    return <div className="p-8 text-center text-[var(--color-text-muted)]">{t('exercise.notfound')}</div>;
  }

  const handleStart = () => {
    setCurrentStepIndex(0);
    // Dynamic start duration
    const initialDuration = exercise.pattern ? exercise.pattern[0].duration : 15;
    setTimeLeft(initialDuration);
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
      const nextStep = currentStepIndex + 1;
      const duration = exercise.pattern ? exercise.pattern[nextStep].duration : 15;
      setTimeLeft(duration);
    } else {
      setShowCelebration(true);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((curr) => curr - 1);
      const prevStep = currentStepIndex - 1;
      const duration = exercise.pattern ? exercise.pattern[prevStep].duration : 15;
      setTimeLeft(duration);
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
      const supabase = getSupabase();
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
      <SEO title={t(exercise.translationKeyTitle)} description={`Detailansicht für die Übung: ${t(exercise.translationKeyTitle)}`} />
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
              <span className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                {t(exercise.translationKeyCategory)} • {t(exercise.translationKeyTitle)}
              </span>
              <button 
                id="btn-exit-exercise"
                onClick={handleExit}
                className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] flex items-center justify-center hover:bg-[var(--color-bg-alt)] transition-colors"
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
                    className="w-48 h-48 rounded-full bg-[var(--color-accent-primary)]/5 flex flex-col items-center justify-center relative mb-12 border border-[var(--color-accent-primary)]/10"
                  >
                    {/* Inner glowing core */}
                    <div className="absolute inset-4 rounded-full bg-[var(--color-bg-border)] flex flex-col items-center justify-center">
                      <span className="text-4xl font-serif text-[var(--color-accent-primary)] font-light">
                        {timeLeft}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted-light)] font-mono tracking-wider uppercase mt-1">sekunden</span>
                    </div>
                  </motion.div>

                  {/* Step content */}
                  <div className="min-h-40 flex flex-col justify-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-primary)] mb-3">
                      {exercise.pattern && exercise.pattern[currentStepIndex] ? exercise.pattern[currentStepIndex].label : `Schritt ${currentStepIndex + 1}`}
                    </span>
                    <motion.p 
                      key={currentStepIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-serif text-[var(--color-text-main)] leading-relaxed max-w-xl"
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
                  <h2 className="text-3xl font-serif text-[var(--color-text-main)]">
                    {language === 'de' ? 'Glückwunsch zum Abschluss!' : 'Session Completed!'}
                  </h2>
                  <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
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
                            : 'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] active:scale-95'
                        }`}
                      >
                        {progressSaved 
                          ? (language === 'de' ? 'Erfolgreich im Profil geloggt ✓' : 'Progress Saved ✓') 
                          : (savingProgress ? '...' : (language === 'de' ? 'Aktivität ins Journal eintragen' : 'Log to Mindfulness Progress'))}
                      </button>
                    ) : (
                      <p className="text-xs text-[var(--color-text-muted-light)] italic">
                        {language === 'de' ? 'Melde dich an, um diese Übung dauerhaft zu loggen.' : 'Log in to save this exercise to your journal.'}
                      </p>
                    )}

                    <button 
                      onClick={handleExit}
                      className="px-6 py-3 rounded-full border border-[var(--color-border-main)] hover:bg-[var(--color-bg-alt)] text-sm font-medium text-[var(--color-text-muted)] transition-colors"
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
                  className="px-4 py-2 hover:bg-[var(--color-bg-border)] rounded-full text-sm font-medium text-[var(--color-text-muted)] disabled:opacity-30 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Zurück</span>
                </button>

                <button 
                  id="btn-exercise-play-pause"
                  onClick={handlePauseToggle}
                  className="w-14 h-14 rounded-full bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] active:scale-95 flex items-center justify-center shadow-md transition-all"
                >
                  {isPaused ? <Play size={24} className="ml-0.5" /> : <Pause size={24} />}
                </button>

                <button 
                  id="btn-exercise-next"
                  onClick={handleSkip}
                  className="px-4 py-2 hover:bg-[var(--color-bg-border)] rounded-full text-sm font-medium text-[var(--color-text-muted)] flex items-center gap-1 transition-colors"
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
      <Link to="/exercises" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>{t('exercise.back')}</span>
      </Link>

      <motion.div 
        id="static-exercise-detail-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] overflow-hidden"
      >
        <div className="ai-image-container relative h-64 md:h-80">
          <img 
            src={exercise.image || 'https://picsum.photos/seed/gentle/800/600'} 
            alt={t(exercise.translationKeyTitle)} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <a href="/impressum#ki-transparenz" className="ai-label">
            <span className="ai-text">[KI]</span>
          </a>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <div>
              <span className="inline-block px-3 py-1 bg-[var(--color-bg-card)]/20 backdrop-blur-md text-white text-xs font-medium rounded-full mb-3 uppercase tracking-wider">
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
          <p className="text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed">
            {t(exercise.translationKeyDesc)}
          </p>

          {exercise.translationKeyOverview && (
            <p className="text-md text-[var(--color-text-main)] mb-8 leading-relaxed font-medium">
              {t(exercise.translationKeyOverview)}
            </p>
          )}

          <h2 className="text-xl font-serif text-[var(--color-accent-primary)] mb-6">{t('exercise.instructions')}</h2>
          
          <div className="bg-[var(--color-bg-body)] p-6 rounded-2xl mb-8 border border-[var(--color-border-main)]">
            <h3 className="font-medium text-[var(--color-text-main)] mb-2">Vorbereitung</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Finde einen bequemen Platz, an dem du ungestört sitzen oder liegen kannst. Atme tief durch, erlaube dir, zur Ruhe zu kommen, und schließe sanft die Augen. Bereite dich darauf vor, dich voll und ganz deinem Atemrhythmus zu widmen.
            </p>
          </div>

          <div className="space-y-6">
            {exercise.instructionKeys.map((key, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-body)] text-[var(--color-accent-primary)] font-medium flex items-center justify-center shrink-0 border border-[var(--color-accent-primary)]/20">
                  {index + 1}
                </div>
                <p className="text-[var(--color-text-muted)] leading-relaxed pt-1">
                  {t(key)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-[var(--color-bg-body)] rounded-2xl flex items-center justify-between border border-[var(--color-border-main)]">
            <div>
              <h3 className="font-medium text-[var(--color-text-main)] mb-1">{t('exercise.ready')}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-2">{t('exercise.begin')}</p>
              <p className="text-xs text-[var(--color-text-muted-light)] italic">
                Dies ist ein Beispiel für den Ablauf, damit du weißt, wie die Übung funktioniert, bevor du sie eigenständig anwendest.
              </p>
            </div>
            <button 
              id="btn-play-exercise"
              onClick={handleStart}
              className="w-12 h-12 rounded-full bg-[var(--color-accent-primary)] text-white flex items-center justify-center hover:bg-[var(--color-accent-hover)] transition-all shadow-md active:scale-95"
            >
              <Play size={20} className="ml-1" />
            </button>
          </div>
          {/* Conditional Audio Player for PMR */}
          {exercise.id === 'pmr' && (
            <div className="bg-[var(--color-bg-body)] rounded-2xl p-6 mt-8 border border-[var(--color-border-main)]">
              <div className="flex items-center justify-between">
                <div className="pr-4 flex-1">
                  <h3 className="text-lg font-serif text-[var(--color-text-main)] mb-1">Geführte Audio-Anleitung</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Für optimale Entspannungsergebnisse empfehlen wir, diese Übung regelmäßig durchzuführen. 
                    Stelle sicher, dass deine Gerätelautstärke eingeschaltet ist.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => {
                        const audio = document.getElementById('audio-pmr') as HTMLAudioElement;
                        if (audio) {
                            if (audio.paused) audio.play();
                            else audio.pause();
                        }
                    }}
                    className="p-5 bg-[var(--color-accent-primary)] text-white rounded-full hover:bg-[var(--color-accent-hover)] transition-all shadow-md transform hover:scale-105"
                  >
                    <Play size={32} />
                  </button>
                  <span className="text-xs font-bold text-[var(--color-accent-primary)] mt-2 uppercase">Hier klicken</span>
                </div>
                <audio id="audio-pmr" src="/Progressive Muskelentspannung.mp3" />
              </div>
              <div className="text-[10px] text-[var(--color-text-muted-light)] mt-4 border-t border-[var(--color-border-main)] pt-2">
                <strong>Audio-Hinweis:</strong> Instrumental und Stimmerzeugung erfolgten mit Unterstützung von KI (Suno AI).
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
