import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabase';

export default function WeeklyChallenge() {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);

  // Dynamic system week calculation
  const currentWeek = Math.ceil(((new Date() as any) - (new Date(new Date().getFullYear(), 0, 1) as any)) / 86400000 / 7);
  const taskIndex = (currentWeek % 3) || 1; // Rotates between task.week1, task.week2, task.week3 (we have 3 tasks defined)
  const taskKey = `task.week${taskIndex}`;
  
  // Persistent tracking key
  const completedKey = `weekly_challenge_week_${currentWeek}`;

  // Check completion status from Supabase metadata
  const isCompleted = localCompleted || !!user?.completed_tasks?.includes(completedKey);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const currentCompleted = user.completed_tasks || [];
      if (!currentCompleted.includes(completedKey)) {
        const nextCompleted = [...currentCompleted, completedKey];

        // Save to Supabase custom user_metadata
        const { data, error } = await supabase.auth.updateUser({
          data: {
            completed_tasks: nextCompleted
          }
        });

        if (!error && data?.user) {
          setLocalCompleted(true);
          // Sync state in AuthContext
          login({
            ...user,
            completed_tasks: nextCompleted
          });
        } else if (error) {
          console.error("Error saving weekly challenge:", error.message);
        }
      }
    } catch (err) {
      console.error("Failed to complete weekly challenge:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      id="weekly-challenge-container"
      className="bg-gradient-to-br from-[var(--color-accent-olive)] to-[#7A7A50] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <Trophy size={18} />
          <span className="text-xs font-medium uppercase tracking-wider">{t('challenge.title')}</span>
        </div>
        
        <h3 className="text-xl font-serif mb-4 leading-snug">
          "{t(taskKey)}"
        </h3>

        {user ? (
          <button 
            id="btn-complete-weekly-challenge"
            onClick={handleComplete}
            disabled={isCompleted || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isCompleted 
                ? 'bg-white/20 text-white cursor-default' 
                : 'bg-white text-[var(--color-accent-olive)] hover:bg-stone-100 shadow-sm active:scale-95'
            }`}
          >
            {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
            {isCompleted ? (t('challenge.completed') || 'Geschafft!') : (loading ? '...' : (t('challenge.complete') || 'Als erledigt markieren'))}
          </button>
        ) : (
          <p className="text-xs opacity-70 italic">
            {t('challenge.login')}
          </p>
        )}
      </div>
    </motion.div>
  );
}
