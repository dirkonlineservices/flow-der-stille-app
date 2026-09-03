import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Trophy, ArrowRight, Lightbulb, Clock, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { progressiveTasks } from '../data/tasks';
import { syncUserWeekProgress } from '../lib/gamificationMonitorService';

export default function WeeklyChallenge() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fallback für nicht eingeloggte Nutzer
  const defaultProgress = { current_task: 0, completions: {}, week_started_at: {} };
  const taskProgress = user?.task_progress || defaultProgress;
  
  const currentTaskIndex = Math.min(taskProgress.current_task || 0, progressiveTasks.length - 1);
  const task = progressiveTasks[currentTaskIndex];
  
  const completionCount = taskProgress.completions?.[currentTaskIndex] || 0;
  
  // Wochenfortschritt des Nutzers mit der Datenbank abgleichen
  useEffect(() => {
    if (user?.id) {
      syncUserWeekProgress(user.id, currentTaskIndex, user.email, user.first_name);
    }
  }, [user?.id, currentTaskIndex]);
  
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
        syncUserWeekProgress(user.id, nextTaskIndex, user.email, user.first_name);
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
        
        <h3 className="text-2xl sm:text-3xl font-serif font-semibold mb-2.5 leading-snug text-[var(--color-text-main)]">
          {task.title}
        </h3>
        
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed mb-6">
          {task.description}
        </p>

        {/* Tipps Section */}
        <div className="bg-[var(--color-bg-card)]/60 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--color-border-main)] mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-[var(--color-accent-primary)]" />
            <h4 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-[var(--color-accent-primary)]">Schritt-für-Schritt Fokus</h4>
          </div>
          <ul className="space-y-2.5">
            {task.tips.map((tip, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-[var(--color-text-main)] flex items-start gap-2.5 leading-relaxed">
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

              {/* 7-Tage Reifezeit Info-Box: Edles, sattes Dunkelgrün */}
              {hasMinReps && !canAdvance && (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 bg-emerald-950/10 dark:bg-emerald-950/40 border-2 border-emerald-800/50 dark:border-emerald-700/60 rounded-2xl text-xs sm:text-sm text-[var(--color-text-main)] flex items-start gap-3.5 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles size={18} />
                  </div>
                  <div className="leading-relaxed">
                    <strong className="text-emerald-950 dark:text-emerald-100 font-bold block text-sm sm:text-base mb-1">
                      3 Wiederholungen gemeistert! ✨
                    </strong>
                    <p className="text-emerald-900/90 dark:text-emerald-200/90 text-xs sm:text-sm leading-relaxed">
                      Noch <strong className="text-emerald-950 dark:text-white font-bold">{daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} Reifezeit</strong> bis Woche {currentTaskIndex + 2}. Vertiefe die Übung gern weiterhin in deinem eigenen Rhythmus!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Bereit für den Aufstieg: Edles, sattes Dunkelgrün */}
              {canAdvance && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 sm:p-5 bg-emerald-950/15 dark:bg-emerald-950/50 border-2 border-emerald-800/60 dark:border-emerald-600/70 rounded-2xl text-xs sm:text-sm flex items-start gap-3.5 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Trophy size={18} />
                  </div>
                  <div className="leading-relaxed">
                    <strong className="text-emerald-950 dark:text-emerald-100 font-bold block text-sm sm:text-base mb-1">
                      Woche {currentTaskIndex + 1} vollständig gemeistert! 🏆
                    </strong>
                    <p className="text-emerald-900/90 dark:text-emerald-200/90 text-xs sm:text-sm leading-relaxed">
                      Großartige Leistung. Du bist bereit für die nächste Stufe und kannst nun in Woche {currentTaskIndex + 2} aufsteigen.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Aktionsbuttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {/* Fokus abschließen Button (kann beliebig oft gedrückt werden) */}
                <button 
                  id="btn-complete-weekly-challenge"
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm active:scale-95 cursor-pointer"
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
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all bg-emerald-800 hover:bg-emerald-900 text-white shadow-md whitespace-nowrap active:scale-95 cursor-pointer"
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
