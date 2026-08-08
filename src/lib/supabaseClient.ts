import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  const lower = email.trim().toLowerCase();
  return lower.replace('@googlemail.com', '@gmail.com');
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
    
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      });
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase.auth.token') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseClient;
};
