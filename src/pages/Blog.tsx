import React, { useEffect, useState } from 'react';
import { BlogPost, BLOG_POSTS } from '../data/blogPosts';
import { BlogCard } from '../components/BlogCard';
import SEO from '../components/SEO';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
        }
      })
      .catch(() => {
        // Fallback: BLOG_POSTS bereits aktiv
      });
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Blog & Impulse für Achtsamkeit und Nervensystem – Flow der Stille" 
        description="Inspirationen, Übungen und Impulse für innere Ruhe, Vagusnerv-Aktivierung und Gelassenheit im Alltag von Jacqueline Schmetzer." 
        canonicalUrl="https://flow-der-stille.de/blog"
        keywords="Achtsamkeit Blog, Meditation Impulse, Vagusnerv Blog, Nervensystem regulieren, Stress bewältigen, Herzkohärenz, Flow der Stille Blog"
      />
      <div className="max-w-5xl mx-auto">
        <header className="mb-16 text-center">
          <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
            Innehalten & Reflektieren
          </span>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mt-2 mb-4">
            Impulse der Stille
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto">
            Kurze Beiträge für deinen Alltag – damit dein Herzschlag wieder seinen eigenen Rhythmus findet.
          </p>
        </header>

        {loading ? (
          <div className="text-center text-[var(--text-muted)] py-12 animate-pulse">
            Beiträge werden geladen...
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-12">Noch keine Beiträge vorhanden.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
