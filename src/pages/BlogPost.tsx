import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogPost, getBlogPostBySlug } from '../data/blogPosts';
import { ArrowLeft, Clock, Calendar, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import ReactMarkdown from 'react-markdown';
import { BlogCta } from '../components/BlogCta';
import { AiIllustrationBadge } from '../components/AiIllustrationBadge';

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(() => (slug ? getBlogPostBySlug(slug) || null : null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const localPost = getBlogPostBySlug(slug);
    if (localPost) {
      setPost(localPost);
      setError(false);
    }
    fetch(`/api/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (data && data.title) {
          setPost(data);
          setError(false);
        }
      })
      .catch(() => {
        if (!localPost) {
          setError(true);
        }
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-24 px-4 text-center animate-pulse">
        Beitrag wird geladen...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-24 px-4 text-center">
        <h1 className="text-3xl font-serif font-light mb-4">Beitrag nicht gefunden</h1>
        <p className="text-[var(--text-muted)] mb-8">Der gesuchte Artikel existiert leider nicht.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline">
          <ArrowLeft size={16} /> Zurück zur Magazin-Übersicht
        </Link>
      </div>
    );
  }

  // Format date nicely (e.g. 29. September 2026)
  const formattedDate = (() => {
    try {
      const [year, month, day] = post.date.split('-');
      if (year && month && day) {
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return dateObj.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch {
      // Fallback
    }
    return post.date;
  })();

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <SEO 
        title={`${post.title} | Flow der Stille`} 
        description={post.excerpt} 
        canonicalUrl={`https://flow-der-stille.de/blog/${slug}`}
        keywords={`${post.title}, Achtsamkeit, Selbsthypnose, Vagusnerv, Flow der Stille Blog`}
      />

      <article className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            <span>Zurück zum Magazin</span>
          </Link>
        </div>

        {/* Header Area */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 text-xs tracking-wider text-[var(--text-muted)] mb-4">
            <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium border border-[var(--accent)]/20 uppercase tracking-widest text-[11px]">
              {post.category}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="opacity-70" />
              {post.readTime}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="opacity-70" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-light text-[var(--text-main)] tracking-tight leading-[1.18] mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-[var(--text-muted)] font-light leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Hero Image with AI Badge */}
          {post.heroImage && (
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] shadow-md my-8 bg-[var(--bg-card)] group">
              <img
                src={post.heroImage}
                alt={post.heroImageAlt || post.title}
                className="w-full h-auto object-cover max-h-[460px]"
                loading="eager"
              />
              <AiIllustrationBadge />
            </div>
          )}
        </header>

        {/* Markdown Content with Customized Typography and Cards */}
        <div className="space-y-6">
          <ReactMarkdown
            components={{
              // Hide redundant H1 from markdown if it duplicates the article title
              h1: ({ children }) => {
                const text = String(children);
                if (text.toLowerCase().includes(post.title.toLowerCase().slice(0, 20))) {
                  return null;
                }
                return (
                  <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-main)] mt-12 mb-6">
                    {children}
                  </h2>
                );
              },
              // Prominent, well-spaced H2 Zwischenüberschrift
              h2: ({ children }) => (
                <div className="mt-14 mb-6 pt-8 border-t border-[var(--border)]/60">
                  <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[var(--text-main)] flex items-center gap-3">
                    <span className="w-1.5 h-6 rounded-full bg-[var(--accent)] shrink-0 opacity-80" />
                    <span>{children}</span>
                  </h2>
                </div>
              ),
              // Clear H3 Subsection
              h3: ({ children }) => (
                <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--text-main)] mt-8 mb-4">
                  {children}
                </h3>
              ),
              // Optimal readable body text
              p: ({ children }) => (
                <p className="text-[17px] sm:text-[18px] text-[var(--text-main)] leading-[1.8] mb-6 font-normal">
                  {children}
                </p>
              ),
              // Numbered lists rendered as modern Step/Impuls cards
              ol: ({ children }) => (
                <div className="my-8 space-y-3.5 pl-0">
                  {React.Children.map(children, (child, idx) => {
                    if (!React.isValidElement(child)) return child;
                    return React.cloneElement(child as React.ReactElement<any>, {
                      orderIndex: idx + 1,
                    });
                  })}
                </div>
              ),
              // Bullet lists
              ul: ({ children }) => (
                <ul className="my-6 space-y-3 pl-1 list-none">
                  {children}
                </ul>
              ),
              // List items
              li: ({ children, orderIndex }: any) => {
                if (orderIndex !== undefined) {
                  return (
                    <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs transition-colors hover:border-[var(--accent)]/40">
                      <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold flex items-center justify-center shrink-0 border border-[var(--accent)]/25 text-sm mt-0.5 select-none">
                        {orderIndex}
                      </span>
                      <div className="text-[16px] sm:text-[17px] text-[var(--text-main)] leading-relaxed flex-1 pt-0.5">
                        {children}
                      </div>
                    </div>
                  );
                }
                return (
                  <li className="flex items-start gap-3 text-[16px] sm:text-[17px] text-[var(--text-main)] leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-2.5 opacity-70" />
                    <span className="flex-1">{children}</span>
                  </li>
                );
              },
              // Blockquote styled as calm meditation quote card
              blockquote: ({ children }) => (
                <div className="my-8 relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border-l-4 border-[var(--accent)] p-6 sm:p-8 shadow-xs">
                  <div className="italic text-[18px] sm:text-[19px] font-serif text-[var(--text-main)] leading-relaxed">
                    {children}
                  </div>
                </div>
              ),
              // Custom images inside markdown with AI Illustration badge
              img: ({ src, alt }: any) => (
                <figure className="my-10 relative group">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm bg-[var(--bg-card)]">
                    <img src={src} alt={alt || ''} className="w-full h-auto object-cover max-h-[480px]" loading="lazy" />
                    <AiIllustrationBadge />
                  </div>
                  {alt && (
                    <figcaption className="text-xs text-[var(--text-muted)] text-center mt-2.5 px-4 font-light">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              // Internal and external links
              a: ({ href, children }: any) => {
                const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
                if (isInternal) {
                  return (
                    <Link
                      to={href}
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] transition-colors"
                    >
                      {children}
                    </Link>
                  );
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] transition-colors"
                  >
                    {children}
                  </a>
                );
              },
              // Subtle divider
              hr: () => <div className="my-12 border-t border-[var(--border)]/60" />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Dynamic Contextual Product Box / Ruhe-Shop Recommendation */}
        <BlogCta slug={post.slug} relatedProduct={post.relatedProduct} />

        {/* Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft size={16} /> Alle Magazin-Beiträge
          </Link>
          <Link
            to="/ruhe-shop"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Zum Ruhe-Shop →
          </Link>
        </div>
      </article>
    </main>
  );
}
