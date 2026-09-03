import React, { useState, useEffect } from 'react';
import { Star, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProductReview, submitProductReview } from '../lib/reviewsService';

interface ProductRatingProps {
  produktId: string;
  average?: number;
  count?: number;
  variant?: 'summary' | 'interactive' | 'inline';
  onRatingChanged?: (newAverage: number, newCount: number) => void;
  className?: string;
}

export function ProductRating({
  produktId,
  average = 5.0,
  count = 0,
  variant = 'summary',
  onRatingChanged,
  className = ''
}: ProductRatingProps) {
  const { user } = useAuth();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getUserProductReview(produktId, user?.id).then((rating) => {
      if (isMounted && rating) {
        setUserRating(rating);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [produktId, user]);

  const handleRate = async (star: number) => {
    if (!user) {
      alert('Bitte logge dich ein, um eine Bewertung abzugeben.');
      return;
    }

    setIsSubmitting(true);
    setUserRating(star);

    const res = await submitProductReview(produktId, user.id, star);
    setIsSubmitting(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      if (onRatingChanged) {
        const newCount = count > 0 ? count : 1;
        onRatingChanged(star, newCount);
      }
    }
  };

  // 1. INLINE / SUMMARY ANSICHT (Wie im App Store auf Produktkarten)
  if (variant === 'summary' || variant === 'inline') {
    const displayScore = count > 0 ? average.toFixed(1) : '5.0';

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`} title={count > 0 ? `${displayScore} von 5 Sternen (${count} Bewertungen)` : 'Neuerscheinung'}>
        <div className="flex items-center text-amber-400">
          {[1, 2, 3, 4, 5].map((s) => {
            const isFilled = count === 0 || s <= Math.round(average);
            return (
              <Star
                key={s}
                size={14}
                className={`${isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            );
          })}
        </div>

        <span className="text-xs font-semibold text-[var(--text-main)]">
          {displayScore}
        </span>

        <span className="text-[11px] text-[var(--text-muted)]">
          {count > 0 ? `(${count})` : '• Neu'}
        </span>
      </div>
    );
  }

  // 2. INTERAKTIVE BEWERTUNGS-BOX (fuer freigeschaltete Hoerer/Kaeufer)
  return (
    <div className={`p-3 sm:p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)]">
            <Sparkles size={14} className="text-amber-400" />
            <span>Wie gefällt dir diese Meditation?</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {userRating 
              ? `Deine Bewertung: ${userRating} von 5 Sternen. Klicke, um sie zu ändern.` 
              : 'Vergib 1 bis 5 Sterne und hilf anderen bei der Auswahl.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Interaktive 5 Sterne */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const activeRating = hoveredStar ?? userRating ?? 0;
              const isFilled = star <= activeRating;

              return (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => handleRate(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer focus:outline-none disabled:opacity-50"
                  title={`${star} von 5 Sternen vergeben`}
                  aria-label={`${star} von 5 Sternen vergeben`}
                >
                  <Star
                    size={22}
                    className={`${
                      isFilled 
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs' 
                        : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                    } transition-colors`}
                  />
                </button>
              );
            })}
          </div>

          {savedSuccess && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in whitespace-nowrap">
              <Check size={13} strokeWidth={2.5} /> Gespeichert!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
