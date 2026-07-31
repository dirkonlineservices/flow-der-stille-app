import { supabase } from './supabase';

interface BlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  readTime?: string;
  author_id?: string;
  [key: string]: any;
}

// Beitrag erstellen
export async function createBlogPost(postData: BlogPostData) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([postData])
    .select();

  if (error) {
    console.error('Fehler beim Speichern:', error);
    return null;
  }

  // Tracking Push
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'generate_lead', // Oder custom event wie 'blog_post_created'
      content_type: 'blog_post',
      item_id: data && data[0] ? data[0].id : undefined
    });
  }

  return data;
}

// Beiträge abrufen
export async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'api_error',
        error_message: error.message,
        error_source: 'supabase_fetch'
      });
    }
    console.error("Datenabruf gescheitert:", error);
    return []; // UI Fallback
  }

  return data;
}
