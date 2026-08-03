import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hilfsfunktion zur E-Mail-Normalisierung gegen den Google-Alias-Konflikt
export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  const lower = email.trim().toLowerCase();
  // Ersetze googlemail.com konsistent durch gmail.com
  return lower.replace('@googlemail.com', '@gmail.com');
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

