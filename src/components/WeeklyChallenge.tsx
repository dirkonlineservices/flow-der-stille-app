import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function WeeklyChallenge() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Da der Agent später die Aufgaben liefert, nutzen wir hier einen Platzhalter
  // anstelle eines kaputten /api/ Aufrufs.
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (!user) return;
    
    // Später senden wir hier an Supabase, dass der User die Agenten-Aufgabe 
    // erledigt hat. Für jetzt setzen wir es lokal einfach auf "Erledigt".
    setCompleted(true);
  };

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
          <span className="text-xs font-medium uppercase tracking-wider">{t('challenge.title') || 'WÖCHENTLICHE CHALLENGE'}</span>
        </div>
        
        {/* Platzhalter-Text, bis der Agent übernimmt */}
        <h3 className="text-xl font-serif mb-4 leading-snug">
          "Nimm dir heute 5 Minuten Zeit, um dein Handy bewusst außer Reichweite zu legen und die Stille zu genießen."
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
            {completed ? 'Geschafft!' : 'Aufgabe abschließen'}
          </button>
        ) : (
          <p className="text-xs opacity-70 italic">
            Logge dich ein, um an der Challenge teilzunehmen.
          </p>
        )}
      </div>
    </motion.div>
  );
}