import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

interface AiIllustrationBadgeProps {
  className?: string;
  label?: string;
}

export function AiIllustrationBadge({ className = '', label = 'Illustration' }: AiIllustrationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`absolute bottom-3 right-3 z-10 select-none ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="backdrop-blur-md bg-black/45 hover:bg-black/65 text-white/95 text-[11px] font-light px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20 transition-all shadow-sm cursor-pointer"
        aria-label="Hinweis zur Illustration: KI-generiert für Flow der Stille"
      >
        <Sparkles size={11} className="text-amber-300 shrink-0" />
        <span>{label}</span>
        <Info size={10} className="opacity-70 ml-0.5 shrink-0" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-56 p-3 rounded-2xl bg-neutral-900/95 text-neutral-100 text-[11px] leading-relaxed border border-neutral-700 shadow-xl backdrop-blur-md z-30 pointer-events-none transition-all">
          <div className="font-medium text-white flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-amber-300" />
            Künstlerische Illustration
          </div>
          <p className="text-neutral-300 text-[10.5px]">
            KI-generiert für Flow der Stille zur achtsamen visuellen Begleitung.
          </p>
        </div>
      )}
    </div>
  );
}
