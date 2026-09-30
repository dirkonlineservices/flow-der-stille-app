import React from 'react';
import { Link } from 'react-router-dom';
import { trackCtaClick } from '../lib/analytics';
import { Headphones, Key, ArrowRight, Heart } from 'lucide-react';

export interface RelatedProduct {
  type?: 'audiobook' | 'session' | 'meditation' | 'shop';
  title: string;
  subtitle?: string;
  badge?: string;
  priceFormatted?: string;
  coverUrl?: string;
  description: string;
  primaryCtaLabel?: string;
  primaryCtaLink: string;
  expressCtaLabel?: string;
  expressCtaLink?: string;
}

interface BlogCtaProps {
  slug: string;
  relatedProduct?: RelatedProduct;
}

export function BlogCta({ slug, relatedProduct }: BlogCtaProps) {
  if (relatedProduct) {
    return (
      <aside className="mt-16 sm:mt-20 relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-sm transition-all hover:shadow-md">
        {/* Zarter Umgebungs-Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
          {relatedProduct.coverUrl && (
            <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-2xl overflow-hidden border border-[var(--border)] shadow-md bg-[var(--bg-alt)]">
              <img
                src={relatedProduct.coverUrl}
                alt={relatedProduct.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                <Headphones size={13} />
                {relatedProduct.badge || 'Passende Hörerfahrung'}
              </span>
              {relatedProduct.priceFormatted && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-main)] whitespace-nowrap">
                  Einmalig {relatedProduct.priceFormatted} • Kein Abo
                </span>
              )}
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-main)] tracking-tight mb-1.5">
              {relatedProduct.title}
            </h3>

            {relatedProduct.subtitle && (
              <p className="text-xs sm:text-sm font-medium text-[var(--accent)] mb-3">
                {relatedProduct.subtitle}
              </p>
            )}

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-6 max-w-xl">
              {relatedProduct.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <Link
                to={relatedProduct.primaryCtaLink}
                onClick={() => trackCtaClick(`blog_related_primary_${slug}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-all shadow-sm hover:scale-[1.02]"
              >
                <Headphones size={16} />
                <span>{relatedProduct.primaryCtaLabel || 'Jetzt anhören'}</span>
                <ArrowRight size={15} />
              </Link>

              {relatedProduct.expressCtaLink && (
                <Link
                  to={relatedProduct.expressCtaLink}
                  onClick={() => trackCtaClick(`blog_related_express_${slug}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full bg-[var(--bg-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-main)] font-medium text-xs sm:text-sm transition-all whitespace-nowrap"
                >
                  <Key size={14} className="text-[var(--accent)]" />
                  <span>{relatedProduct.expressCtaLabel || 'Express-Kauf mit Magic Link'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Standard-Fallback für allgemeine Beiträge
  return (
    <div className="mt-16 sm:mt-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 text-center shadow-sm">
      <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
        <Heart size={24} />
      </div>
      <h3 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[var(--text-main)] mb-3">
        Finde deinen inneren Rhythmus
      </h3>
      <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto mb-8 leading-relaxed">
        Erlebe geführte Selbsthypnosen und Achtsamkeitsmeditationen direkt im Web-Player oder in der Android App – ohne Abo, ab 1,99&nbsp;€.
      </p>
      <Link
        to="/ruhe-shop"
        onClick={() => trackCtaClick(`blog_post_${slug}`)}
        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors shadow-sm"
      >
        <span>Ruhe-Shop entdecken</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
