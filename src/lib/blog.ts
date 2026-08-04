import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  readTime: string;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }

    const fileNames = fs.readdirSync(postsDirectory);
    let mdFiles = fileNames.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));

    // If no posts exist, create a default sample post
    if (mdFiles.length === 0) {
      const samplePath = path.join(postsDirectory, 'innere-ruhe-im-alltag.md');
      const sampleContent = `---
title: "Innere Ruhe im Alltag finden"
date: "2026-06-01"
excerpt: "Erfahre, wie du mit einfachen Atemübungen und bewussten Pausen mehr Gelassenheit in deinen Tag bringst."
category: "Herzkompass"
readTime: "5 Min."
---

In unserer heutigen, oft hektischen Welt ist es gar nicht so einfach, bei sich selbst zu bleiben. Gedanken kreisen, Termine drängen, und der Atem wird flach.

### Der erste Schritt: Bewusstes Atmen

Wenn du merkst, dass die Anspannung steigt, halte kurz inne. Nimm drei tiefe Atemzüge in den Bauch. Spüre, wie sich die Bauchdecke hebt und senkt.

- **Einatmen:** Ruhe einladen.
- **Ausatmen:** Anspannung loslassen.

Mit diesen kleinen Momenten der Stille schaffst du Anker im Alltag.`;
      fs.writeFileSync(samplePath, sampleContent, 'utf8');
      mdFiles = ['innere-ruhe-im-alltag.md'];
    }

    const posts = mdFiles
      .map((fileName) => {
        try {
          const slug = fileName.replace(/\.mdx?$/, '');
          const fullPath = path.join(postsDirectory, fileName);
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const { data, content } = matter(fileContents);

          return {
            slug,
            content,
            title: data.title || 'Unbenannter Beitrag',
            date: data.date || new Date().toISOString().split('T')[0],
            excerpt: data.excerpt || '',
            category: data.category || 'Herzkompass',
            readTime: data.readTime || '5 Min.',
          };
        } catch (e) {
          console.error(`Error reading blog post ${fileName}:`, e);
          return null;
        }
      })
      .filter((p): p is BlogPost => p !== null);

    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    return [];
  }
}

