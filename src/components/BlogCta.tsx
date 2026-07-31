import React from 'react';
import { Link } from 'react-router-dom';
import { trackCtaClick } from '../lib/analytics';
import { Heart } from 'lucide-react';

export function BlogCta({ slug }: { slug: string }) {
  return (
    <div className="mt-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 text-center shadow-sm">
      <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
        <Heart size={24} />
      </div>
      <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-[var(--text-main)] mb-4">
        Finde deinen inneren Rhythmus
      </h3>
      <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto mb-8 leading-relaxed">
        Erlebe die Herzkompass-Meditation direkt in unserer App und begleite deinen Tag mit geführten Atem- und Achtsamkeitsübungen.
      </p>
      <Link
        to="/premium"
        onClick={() => trackCtaClick(`blog_post_${slug}`)}
        className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors shadow-sm"
      >
        Jetzt Herzkompass entdecken →
      </Link>
    </div>
  );
}
