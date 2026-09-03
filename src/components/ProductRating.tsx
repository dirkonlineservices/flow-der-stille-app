import React, { useState, useEffect } from 'react';
import { Star, Check, Sparkles, MessageSquare, Send, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProductReview, submitProductReview } from '../lib/reviewsService';

interface ProductRatingProps {
  produktId: string;
  produktTitel?: string;
  average?: number;
  count?: number;
  variant?: 'summary' | 'interactive' | 'inline';
  onRatingChanged?: (newAverage: number, newCount: number) => void;
  className?: string;
}

export function ProductRating({
  produktId,
  produktTitel,
  average = 5.0,
  count = 0,
  variant = 'summary',
  onRatingChanged,
  className = ''
}: ProductRatingProps) {
  const { user } = useAuth();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState<string>('');
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getUserProductReview(produktId, user?.id).then((review) => {
      if (isMounted && review) {
        setUserRating(review.sterne);
        if (review.kommentar) {
          setUserComment(review.kommentar);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [produktId, user]);

  const handleRate = async (star: number, optionalComment?: string) => {
    if (!user) {
      alert('Bitte logge dich ein, um eine Bewertung abzugeben.');
      return;
    }

    setIsSubmitting(true);
    setUserRating(star);

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Nutzer';
    const userEmail = user.email || '';

    const res = await submitProductReview(
      produktId,
      user.id,
      star,
      optionalComment !== undefined ? optionalComment : userComment,
      userEmail,
      userName,
      produktTitel
    );
    setIsSubmitting(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);

      // Bei 1 oder 2 Sternen Kommentarbox direkt vorschlagen falls noch leer
      if (star <= 2 && !userComment) {
        setShowCommentBox(true);
      }

      if (onRatingChanged) {
        const newCount = count > 0 ? count : 1;
        onRatingChanged(star, newCount);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRating) return;
    await handleRate(userRating, userComment);
    setShowCommentBox(false);
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
  const isCritical = (hoveredStar ?? userRating ?? 0) <= 2 && (hoveredStar ?? userRating ?? 0) > 0;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] shadow-2xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--text-main)]">
            {isCritical ? (
              <AlertTriangle size={15} className="text-amber-500" />
            ) : (
              <Sparkles size={15} className="text-amber-400" />
            )}
            <span>Wie gefällt dir diese Meditation?</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {userRating 
              ? `Deine Bewertung: ${userRating} von 5 Sternen. Klicke, um sie zu ändern.` 
              : 'Tippe auf die Sterne, um deine Bewertung abzugeben.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interaktive 5 Sterne */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] px-2.5 py-1 rounded-xl border border-[var(--border)]">
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

          {userRating && (
            <button
              type="button"
              onClick={() => setShowCommentBox(!showCommentBox)}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>{showCommentBox ? 'Text schließen' : userComment ? 'Feedback bearbeiten' : 'Feedback schreiben'}</span>
            </button>
          )}

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in whitespace-nowrap">
              <Check size={14} strokeWidth={2.5} /> Gespeichert &amp; Team benachrichtigt!
            </span>
          )}
        </div>
      </div>

      {/* Optionales Kommentar-/Feedback-Feld (insb. bei 1-2 Sternen wichtig) */}
      {showCommentBox && (
        <form onSubmit={handleCommentSubmit} className="mt-3.5 pt-3 border-t border-[var(--border)]/70 space-y-2">
          <label className="block text-xs font-medium text-[var(--text-main)]">
            {userRating && userRating <= 2 ? (
              <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                <AlertTriangle size={13} /> Was hat dir nicht gefallen oder was können wir verbessern?
              </span>
            ) : (
              <span>Möchtest du uns noch kurz mitteilen, was dir gefallen hat oder was wir beachten sollen?</span>
            )}
          </label>
          <textarea
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder={userRating && userRating <= 2 ? 'Erzähle uns bitte, was nicht gepasst hat, damit wir persönlich darauf eingehen können...' : 'Deine persönliche Erfahrung oder Anmerkung...'}
            rows={2}
            className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">
              Unser Team wird automatisch per E-Mail benachrichtigt und kann dir antworten.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Send size={12} />
              <span>Absenden</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
