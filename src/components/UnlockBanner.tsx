import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function UnlockBanner() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-100 p-2 rounded-full">
          <CheckCircle2 className="text-emerald-600 h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-emerald-900">Vielen Dank für deine Unterstützung!</p>
          <p className="text-xs text-emerald-700">Dein Kurs wurde erfolgreich freigeschaltet.</p>
        </div>
      </div>
      <div className="h-2 w-full bg-emerald-100 rounded-full mt-4 overflow-hidden">
        <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
