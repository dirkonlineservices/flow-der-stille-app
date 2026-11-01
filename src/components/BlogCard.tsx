import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../lib/blog';
import { trackBlogClick } from '../lib/analytics';

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 transition-all hover:border-[var(--accent)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
          <span className="uppercase tracking-wider font-medium text-[var(--accent)]">
            {post.category}
          </span>
          <span>{post.readTime}</span>
        </div>
        <h2 className="text-xl font-medium mb-3 line-clamp-2 leading-snug">
          <Link
            to={`/blog/${post.slug}`}
            onClick={() => trackBlogClick(post.title, post.slug, post.category)}
            className="hover:text-[var(--accent)] transition-colors"
          >
            {post.title}
          </Link>
        </h2>
        <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-6 leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{post.date}</span>
        <Link
          to={`/blog/${post.slug}`}
          onClick={() => trackBlogClick(post.title, post.slug, post.category)}
          className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors inline-flex items-center gap-1"
        >
          Lesen →
        </Link>
      </div>
    </article>
  );
}

