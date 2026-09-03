import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Trophy, ArrowRight, Lightbulb, Clock, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { progressiveTasks } from '../data/tasks';

export default function WeeklyChallenge() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fallback für nicht eingeloggte Nutzer
  const defaultProgress = { current_task: 0, completions: {}, week_started_at: {} };
  const taskProgress = user?.task_progress || defaultProgress;
  
  const currentTaskIndex = Math.min(taskProgress.current_task || 0, progressiveTasks.length - 1);
  const task = progressiveTasks[currentTaskIndex];
  
  const completionCount = taskProgress.completions?.[currentTaskIndex] || 0;
  
  // ============================================================================
  // 7-TAGE-SPERRE & REIFEZEIT LOGIK
  // ============================================================================
  const MIN_REPETITIONS = 3;
  const DAYS_PER_WEEK = 7;

  // Startzeitpunkt der aktuellen Woche (wird bei erster Wiederholung gesetzt)
  const weekStartedAt = taskProgress.week_started_at?.[currentTaskIndex];

  let daysPassed = 0;
  let daysRemaining = DAYS_PER_WEEK;
  let currentDayOfCycle = 1;

  if (weekStartedAt) {
    const startedMs = new Date(weekStartedAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - startedMs);
    daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, DAYS_PER_WEEK - daysPassed);
    currentDayOfCycle = Math.min(DAYS_PER_WEEK, daysPassed + 1);
  }

  // Bedingungen für die Freischaltung der nächsten Woche:
  // 1. Mindestens 3 Wiederholungen gemacht
  // 2. Mindestens 7 Tage seit Beginn der Woche vergangen
  const hasMinReps = completionCount >= MIN_REPETITIONS;
  const hasCompleted7Days = weekStartedAt ? daysPassed >= DAYS_PER_WEEK : false;
  const canAdvance = hasMinReps && hasCompleted7Days;

  // ============================================================================
  // FOKUS ABSCHLIESSEN (+1 Wiederholung)
  // ============================================================================
  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const newCompletions = { ...(taskProgress.completions || {}) };
      const currentCount = newCompletions[currentTaskIndex] || 0;
      newCompletions[currentTaskIndex] = currentCount + 1;

      // Wenn die Woche noch kein Startdatum hat, jetzt mit der 1. Wiederholung starten
      const newWeekStartedAt = { ...(taskProgress.week_started_at || {}) };
      if (!newWeekStartedAt[currentTaskIndex]) {
        newWeekStartedAt[currentTaskIndex] = new Date().toISOString();
      }

      const newTaskProgress = {
        ...taskProgress,
        completions: newCompletions,
        week_started_at: newWeekStartedAt
      };

      const historyKey = `weekly_challenge_week_${currentTaskIndex + 1}_V${currentCount + 1}_${new Date().toISOString().split('T')[0]}`;
      const currentCompletedTasks = user.completed_tasks || [];
      const nextCompletedTasks = [...currentCompletedTasks, historyKey];

      const supabase = getSupabase();
      const { data, error } = await supabase.auth.updateUser({
        data: {
          task_progress: newTaskProgress,
          completed_tasks: nextCompletedTasks
        }
      });

      if (!error && data?.user) {
        login({
          ...user,
          task_progress: newTaskProgress,
          completed_tasks: nextCompletedTasks
        });
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Aufgabe:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // NÄCHSTE WOCHE FREISCHALTEN (nach 7 Tagen & 3+ Wiederholungen)
  // ============================================================================
  const handleAdvance = async () => {
    if (!user || currentTaskIndex >= progressiveTasks.length - 1) return;
    setLoading(true);

    try {
      const nextTaskIndex = currentTaskIndex + 1;
      const newWeekStartedAt = { ...(taskProgress.week_started_at || {}) };
      // Startdatum für die nächste Woche setzen
      newWeekStartedAt[nextTaskIndex] = new Date().toISOString();

      const newTaskProgress = {
        ...taskProgress,
        current_task: nextTaskIndex,
        week_started_at: newWeekStartedAt
      };

      const supabase = getSupabase();
      const { data, error } = await supabase.auth.updateUser({
        data: {
          task_progress: newTaskProgress
        }
      });

      if (!error && data?.user) {
        login({
          ...user,
          task_progress: newTaskProgress
        });
      }
    } catch (err) {
      console.error("Fehler beim Voranschreiten:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      id="weekly-challenge-container"
      className="bg-gradient-to-br from-[var(--color-bg-alt-darker)] to-[var(--color-bg-alt)] text-[var(--color-text-main)] p-6 lg:p-8 rounded-3xl shadow-sm border border-[var(--color-border-main)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 text-[var(--color-accent-primary)] pointer-events-none">
        <Trophy size={160} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header mit Woche & Level */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[var(--color-accent-primary)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)]">
              Woche {currentTaskIndex + 1} von 52
            </span>
          </div>
          {user && (
            <div className="text-[10px] uppercase font-bold text-[var(--color-accent-primary)] bg-[var(--color-bg-card)] px-3 py-1 rounded-full border border-[var(--color-border-main)] shadow-sm flex items-center gap-1.5">
              <span>Level {currentTaskIndex + 1}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-serif mb-2 leading-snug text-[var(--color-text-main)]">
          {task.title}
        </h3>
        
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          {task.description}
        </p>

        {/* Tipps Section */}
        <div className="bg-[var(--color-bg-card)]/60 backdrop-blur-sm rounded-2xl p-4 border border-[var(--color-border-main)] mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-[var(--color-accent-primary)]" />
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent-primary)]">Schritt-für-Schritt Fokus</h4>
          </div>
          <ul className="space-y-2.5">
            {task.tips.map((tip, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-[var(--color-text-main)] flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress & 7-Tage-Sperre Information */}
        <div className="mt-auto space-y-4">
          {user ? (
            <div className="space-y-3">
              {/* Status-Leiste: Wiederholungen & Wochentag */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-[var(--color-text-main)] px-1">
                <div className="flex items-center gap-1.5">
                  <span>Wiederholungen:</span>
                  <span className="bg-[var(--color-bg-card)] px-2.5 py-1 rounded-lg border border-[var(--color-border-main)] font-bold text-[var(--color-text-main)] shadow-2xs">
                    {completionCount} {completionCount >= MIN_REPETITIONS ? '✓ (Min. 3 erreicht)' : `/ ${MIN_REPETITIONS} Min.`}
                  </span>
                </div>

                {weekStartedAt && (
                  <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs font-medium">
                    <Clock size={14} />
                    <span>Tag {currentDayOfCycle} von {DAYS_PER_WEEK}</span>
                  </div>
                )}
              </div>

              {/* 7-Tage Reifezeit Info-Box: Kein Gelb-auf-Gelb, bester Kontrast */}
              {hasMinReps && !canAdvance && (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--color-bg-card)] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl text-xs sm:text-sm text-[var(--color-text-main)] flex items-start gap-3 shadow-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={18} />
                  </div>
                  <div className="leading-relaxed">
                    <strong className="text-emerald-800 dark:text-emerald-300 font-semibold block text-sm sm:text-base mb-0.5">
                      3 Wiederholungen gemeistert! ✨
                    </strong>
                    <p className="text-[var(--color-text-muted)] text-xs sm:text-sm">
                      Noch <strong className="text-[var(--color-text-main)] font-semibold">{daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} Reifezeit</strong> bis Woche {currentTaskIndex + 2}. Vertiefe die Übung gern weiterhin in deinem eigenen Tempo!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Bereit für den Aufstieg */}
              {canAdvance && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5 font-medium"
                >
                  <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Woche {currentTaskIndex + 1} vollständig gemeistert! Du kannst jetzt in die nächste Stufe aufsteigen.</span>
                </motion.div>
              )}
              
              {/* Aktionsbuttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {/* Fokus abschließen Button (kann beliebig oft gedrückt werden) */}
                <button 
                  id="btn-complete-weekly-challenge"
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm active:scale-95 cursor-pointer"
                >
                  <CheckCircle size={18} />
                  <span>{loading ? 'Wird gespeichert...' : 'Fokus abgeschlossen (+1)'}</span>
                </button>

                {/* Nächste Woche Button (NUR sichtbar wenn 7 Tage + 3 Wiederholungen) */}
                <AnimatePresence>
                  {canAdvance && currentTaskIndex < progressiveTasks.length - 1 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={handleAdvance}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md whitespace-nowrap active:scale-95 cursor-pointer"
                      title="Woche abgeschlossen. Zeit für das nächste Level!"
                    >
                      <span>Nächste Woche (Level {currentTaskIndex + 2})</span>
                      <ArrowRight size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-bg-card)]/80 rounded-xl p-4 border border-[var(--color-border-main)] text-center shadow-sm">
              <p className="text-xs text-[var(--color-text-muted)]">
                Melde dich an, um deinen Fortschritt Woche für Woche zu speichern und neue Level freizuschalten.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
