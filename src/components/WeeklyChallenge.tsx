import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Circle, Trophy, ArrowRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { progressiveTasks } from '../data/tasks';

export default function WeeklyChallenge() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fallback für nicht eingeloggte Nutzer
  const defaultProgress = { current_task: 0, completions: {} };
  const taskProgress = user?.task_progress || defaultProgress;
  
  const currentTaskIndex = Math.min(taskProgress.current_task, progressiveTasks.length - 1);
  const task = progressiveTasks[currentTaskIndex];
  
  const completionCount = taskProgress.completions[currentTaskIndex] || 0;
  // Wir sagen mal: Ab 3 Wiederholungen KANN man in die nächste Woche springen
  const canAdvance = completionCount >= 3;

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const newCompletions = { ...taskProgress.completions };
      const currentCount = newCompletions[currentTaskIndex] || 0;
      newCompletions[currentTaskIndex] = currentCount + 1;

      const newTaskProgress = {
        ...taskProgress,
        completions: newCompletions
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

  const handleAdvance = async () => {
    if (!user || user.task_progress?.current_task >= progressiveTasks.length - 1) return;
    setLoading(true);

    try {
      const newTaskProgress = {
        ...taskProgress,
        current_task: taskProgress.current_task + 1
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
      <div className="absolute top-0 right-0 p-4 opacity-5 text-[var(--color-accent-primary)]">
        <Trophy size={160} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[var(--color-accent-primary)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)]">
              Woche {currentTaskIndex + 1}
            </span>
          </div>
          {user && (
            <div className="text-[10px] uppercase font-bold text-[var(--color-accent-primary)] bg-[var(--color-bg-card)] px-2.5 py-1 rounded-full border border-[var(--color-border-main)] shadow-sm">
              Level {currentTaskIndex + 1}
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
              <li key={idx} className="text-xs text-[#4f5651] flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-1.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress and Actions */}
        <div className="mt-auto">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--color-accent-primary)] mb-2 px-1">
                <span>Wiederholungen dieser Woche:</span>
                <span className="bg-[var(--color-bg-card)] px-2 py-0.5 rounded border border-[var(--color-border-main)]">
                  {completionCount} / 3+
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  id="btn-complete-weekly-challenge"
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm active:scale-95"
                >
                  <CheckCircle size={18} />
                  {loading ? 'Wird gespeichert...' : 'Fokus abgeschlossen (+1)'}
                </button>

                <AnimatePresence>
                  {canAdvance && currentTaskIndex < progressiveTasks.length - 1 && (
                    <motion.button
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      onClick={handleAdvance}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-alt)] shadow-sm whitespace-nowrap active:scale-95"
                      title="Du hast diese Woche gemeistert. Zeit für die nächste Stufe."
                    >
                      <span className="hidden sm:inline">Nächste Woche</span>
                      <span className="sm:hidden">Weiter</span>
                      <ArrowRight size={18} className="text-[var(--color-accent-primary)]" />
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
