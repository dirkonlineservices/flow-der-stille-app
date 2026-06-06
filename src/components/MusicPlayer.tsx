import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Music, X, Minimize2, Maximize2, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const Player = ReactPlayer as any;

export default function MusicPlayer() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  // Using a specific relaxing video from Raindancer music
  const url = 'https://www.youtube.com/watch?v=kY7hF0Yw9cQ';

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden w-80"
          >
            <div className="p-4 bg-[var(--color-accent-olive)] text-white flex justify-between items-center">
              <h3 className="font-serif font-medium">{t('music.title')}</h3>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                <Minimize2 size={18} />
              </button>
            </div>
            
            <div className="relative aspect-video bg-black">
              <Player
                url={url}
                playing={isPlaying}
                volume={volume}
                width="100%"
                height="100%"
                controls={true}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>

            <div className="p-4 flex flex-col gap-3">
               <div className="flex items-center gap-2">
                 <Volume2 size={16} className="text-stone-400" />
                 <input 
                   type="range" 
                   min={0} 
                   max={1} 
                   step={0.01} 
                   value={volume} 
                   onChange={(e) => setVolume(parseFloat(e.target.value))}
                   className="w-full accent-[var(--color-accent-olive)] h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                 />
               </div>
               <p className="text-xs text-stone-400 text-center">
                 {t('music.credit')}
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen || isPlaying 
            ? 'bg-[var(--color-accent-olive)] text-white' 
            : 'bg-white text-[var(--color-accent-olive)] border border-[var(--color-accent-olive)]'
        }`}
      >
        {isPlaying ? (
            <div className="relative">
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[var(--color-accent-olive)]"></span>
                <Music size={24} />
            </div>
        ) : (
            <Music size={24} />
        )}
      </motion.button>
    </div>
  );
}
