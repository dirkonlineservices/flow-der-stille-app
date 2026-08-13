import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  const lower = email.trim().toLowerCase();
  return lower.replace('@googlemail.com', '@gmail.com');
};

// Prüft ob wir in einer nativen Capacitor-App sind
const isNativeCapacitor = (): boolean => {
  try {
    return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
  } catch {
    return false;
  }
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    const DEFAULT_SUPABASE_URL = "https://fsfoxgezrcqkjhfyqcwa.supabase.co";
    const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZm94Z2V6cmNxa2poZnlxY3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDE1MDgsImV4cCI6MjA5NjMxNzUwOH0.3srV9G8iho-xrhkRx7KNZWWadmWxZmuW-AV4Jaz4oeQ";

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    const native = isNativeCapacitor();

    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // In der nativen App kein URL-Hash-Parsing (kein Browser-URL),
          // im Web-Browser dagegen schon (für Magic Links / OAuth Callbacks)
          detectSessionInUrl: !native,
          // Stabiler storage key für beide Plattformen
          storageKey: 'flow-der-stille-auth',
        }
      });
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      // Fallback: Alle alten Auth-Tokens löschen und neu erstellen
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase.auth.token') || key.startsWith('sb-') || key.startsWith('flow-der-stille-auth')) {
          localStorage.removeItem(key);
        }
      });
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: !native,
          storageKey: 'flow-der-stille-auth',
        }
      });
    }
  }
  return supabaseClient;
};

// Session aus dem Cache löschen (für Debugging / Notfall-Logout)
export const clearSupabaseSession = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (
      key.includes('supabase.auth.token') ||
      key.startsWith('sb-') ||
      key === 'flow-der-stille-auth'
    ) {
      localStorage.removeItem(key);
    }
  });
  supabaseClient = null;
};
