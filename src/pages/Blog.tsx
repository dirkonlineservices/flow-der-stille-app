import React, { useEffect, useState } from 'react';
import { BlogPost } from '../lib/blog';
import { BlogCard } from '../components/BlogCard';
import SEO from '../components/SEO';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch blog posts:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Blog & Impulse | Flow der Stille" 
        description="Inspirationen, geführte Meditationen und Wege zu mehr innerer Ruhe." 
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
