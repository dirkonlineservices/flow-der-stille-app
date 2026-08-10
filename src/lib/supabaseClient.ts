import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  const lower = email.trim().toLowerCase();
  return lower.replace('@googlemail.com', '@gmail.com');
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    const DEFAULT_SUPABASE_URL = "https://fsfoxgezrcqkjhfyqcwa.supabase.co";
    const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZm94Z2V6cmNxa2poZnlxY3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDE1MDgsImV4cCI6MjA5NjMxNzUwOH0.3srV9G8iho-xrhkRx7KNZWWadmWxZmuW-AV4Jaz4oeQ";

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    
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
