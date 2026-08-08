import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogPost } from '../lib/blog';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import ReactMarkdown from 'react-markdown';
import { BlogCta } from '../components/BlogCta';

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-20 px-4 text-center animate-pulse">
        Beitrag wird geladen...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-20 px-4 text-center">
        <h1 className="text-3xl font-light mb-4">Beitrag nicht gefunden</h1>
        <p className="text-[var(--text-muted)] mb-8">Der gesuchte Artikel existiert leider nicht.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline">
          <ArrowLeft size={16} /> Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-20 px-4 sm:px-6">
      <SEO title={`${post.title} | Flow der Stille`} description={post.excerpt} />
      <article className="max-w-3xl mx-auto">
        <Link
          to="/blog"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mb-8 inline-block transition-colors"
        >
          ← Zurück zur Übersicht
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
            <span className="text-[var(--accent)] font-semibold">{post.category}</span>
            <span>•</span>
            <span>{post.readTime}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="prose prose-stone dark:prose-invert max-w-none text-[var(--text-main)] leading-relaxed text-base sm:text-lg">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* CTA Box für die App / Herzkompass */}
        <BlogCta slug={post.slug} />
      </article>
    </main>
  );
}
