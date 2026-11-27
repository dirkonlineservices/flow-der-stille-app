import React, { useState } from 'react';
import { Play, Mic } from 'lucide-react';

const VIDEO_SRC = '/videos/lisa-ragusa-echte-stimme.mp4';
const POSTER_SRC = '/videos/lisa-ragusa-echte-stimme-poster.jpg';

/**
 * Short video of Lisa Ragusa proving that the narrator voice is a real human voice, not AI.
 * The video is only loaded after the visitor taps play (no autoplay, no preload).
 */
export const LisaVoiceVideo: React.FC = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      id="lisa-video"
      className="scroll-mt-24 flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs"
    >
      <div className="relative w-44 sm:w-48 shrink-0 aspect-[478/850] rounded-xl overflow-hidden bg-stone-200">
        {playing ? (
          <video
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            aria-describedby="lisa-video-text"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full cursor-pointer"
            aria-label="Video abspielen: Lisa Ragusa stellt sich vor (20 Sekunden)"
          >
            <img
              src={POSTER_SRC}
              alt="Lisa Ragusa, Sprecherin von Flow der Stille"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 text-emerald-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Play size={24} className="fill-emerald-900 ml-1" />
            </span>
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold">
              0:20
            </span>
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 self-center sm:self-start px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Mic size={12} />
          Echte Stimme, keine KI
        </span>
        <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-950 leading-snug">
          Hier spricht Lisa
        </h3>
        <p id="lisa-video-text" className="mt-2 text-sm text-stone-800 leading-relaxed">
          Viele fragen uns, ob die Stimme in unseren Meditationen, Selbsthypnosen und Hörbüchern von einer KI stammt.
          Das tut sie nicht. Lisa Ragusa spricht alle Inhalte persönlich ein. In diesem kurzen Video stellt sie sich selbst vor.
        </p>
        <p className="mt-2 text-xs text-stone-700 leading-relaxed">
          <strong className="font-semibold text-stone-950">Textfassung (sinngemäß):</strong> Lisa erzählt, dass sie die Stimme
          hinter den Hörbüchern, Meditationen und Selbsthypnosen von Flow der Stille ist und dass es sich dabei nicht um eine KI-Stimme handelt.
        </p>
      </div>
    </div>
  );
};

export default LisaVoiceVideo;
