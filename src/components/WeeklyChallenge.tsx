import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Task {
  id: number;
  week_number: number;
  description: string;
}

export default function WeeklyChallenge() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [task, setTask] = useState<Task | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks/current')
      .then(res => res.json())
      .then(data => {
        setTask(data);
        if (user) {
          fetch(`/api/tasks/status/${data.id}`)
            .then(res => res.json())
            .then(status => setCompleted(status.completed));
        }
        setLoading(false);
      });
  }, [user]);

  const handleComplete = () => {
    if (!user || !task) return;

    fetch('/api/tasks/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCompleted(true);
      }
    });
  };

  if (loading) return <div className="animate-pulse h-24 bg-stone-100 rounded-2xl"></div>;
  if (!task) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
          {t(task.description)}
        </h3>

        {user ? (
          <button 
            onClick={handleComplete}
            disabled={completed}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              completed 
                ? 'bg-white/20 text-white cursor-default' 
                : 'bg-white text-[var(--color-accent-olive)] hover:bg-stone-100 shadow-sm'
            }`}
          >
            {completed ? <CheckCircle size={16} /> : <Circle size={16} />}
            {completed ? t('challenge.completed') : t('challenge.complete')}
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
