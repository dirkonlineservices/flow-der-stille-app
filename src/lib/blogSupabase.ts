import { getSupabase } from './supabaseClient';
import { pushToDataLayer } from './tracking';

interface BlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  readTime?: string;
  author_id?: string;
  [key: string]: any;
}

export async function createBlogPost(postData: BlogPostData) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([postData])
    .select();

  if (error) {
    console.error('Fehler beim Speichern:', error);
    return null;
  }

  pushToDataLayer({
    event: 'blog_post_created',
    content_type: 'blog_post',
    item_id: data && data[0] ? data[0].id : undefined
  });

  return data;
}

export async function fetchBlogPosts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    pushToDataLayer({
      event: 'api_error',
      error_message: error.message,
      error_source: 'supabase_fetch'
    });
    console.error("Datenabruf gescheitert:", error);
    return [];
  }

  return data;
}
