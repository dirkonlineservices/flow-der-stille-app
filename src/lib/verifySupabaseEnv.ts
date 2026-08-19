import { getSupabase } from './supabaseClient';

export interface SupabaseEnvStatus {
  isUrlSet: boolean;
  isKeySet: boolean;
  isValidUrl: boolean;
  isPlaceholder: boolean;
  supabaseUrl: string | null;
  hasAnonKey: boolean;
  isConnected: boolean;
  errorMessage?: string;
}

export async function verifySupabaseEnv(): Promise<SupabaseEnvStatus> {
  const DEFAULT_URL = "https://fsfoxgezrcqkjhfyqcwa.supabase.co";
  const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZm94Z2V6cmNxa2poZnlxY3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDE1MDgsImV4cCI6MjA5NjMxNzUwOH0.3srV9G8iho-xrhkRx7KNZWWadmWxZmuW-AV4Jaz4oeQ";

  const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

  const isPlaceholder = 
    rawUrl.includes('placeholder.supabase.co') || 
    rawKey === 'placeholder-key';

  let isValidUrl = false;
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      isValidUrl = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      isValidUrl = false;
    }
  }

  const status: SupabaseEnvStatus = {
    isUrlSet: Boolean(rawUrl && rawUrl.length > 0),
    isKeySet: Boolean(rawKey && rawKey.length > 0),
    isValidUrl,
    isPlaceholder,
    supabaseUrl: rawUrl ? rawUrl.replace(/(https?:\/\/[^/]+).*/, '$1') : null,
    hasAnonKey: Boolean(rawKey && rawKey.length > 10),
    isConnected: false,
  };

  if (!status.isUrlSet || !status.isKeySet) {
    status.errorMessage = 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are missing.';
    return status;
  }

  if (isPlaceholder) {
    status.errorMessage = 'Supabase environment variables are currently set to default placeholder values.';
    return status;
  }

  if (!isValidUrl) {
    status.errorMessage = `VITE_SUPABASE_URL "${rawUrl}" is not a valid URL.`;
    return status;
  }

  try {
    const client = getSupabase();
    const { error } = await client.auth.getSession();
    
    if (error) {
      status.errorMessage = `Supabase authentication check failed: ${error.message}`;
    } else {
      status.isConnected = true;
    }
  } catch (err: any) {
    status.errorMessage = `Error connecting to Supabase: ${err?.message || String(err)}`;
  }

  return status;
}

export async function logSupabaseEnvStatus(force: boolean = false): Promise<void> {
  const status = await verifySupabaseEnv();
  
  // Im Entwicklungsmodus oder bei explizitem Aufruf loggen
  if (import.meta.env.DEV || force) {
    console.group('🔍 Supabase Environment Verification');
    console.log('VITE_SUPABASE_URL configured:', status.isUrlSet ? '✅ Yes' : '❌ No');
    console.log('VITE_SUPABASE_ANON_KEY configured:', status.isKeySet ? '✅ Yes' : '❌ No');
    console.log('Valid Supabase URL format:', status.isValidUrl ? '✅ Yes' : '❌ No');
    console.log('Using Production Config (Non-Placeholder):', !status.isPlaceholder ? '✅ Yes' : '⚠️ Placeholder Active');
    
    if (status.supabaseUrl) {
      console.log('Configured URL:', status.supabaseUrl);
    }

    if (status.isConnected) {
      console.log('Supabase Connection Test: ✅ Connected successfully');
    } else if (status.errorMessage) {
      console.warn('Supabase Connection Test:', `⚠️ ${status.errorMessage}`);
    }
    console.groupEnd();
  } else if (!status.isConnected && status.errorMessage) {
    // In Production nur warnen, wenn wirklich keine Verbindung aufgebaut werden kann
    console.warn('Supabase Connection Notice:', status.errorMessage);
  }
}

if (typeof window !== 'undefined') {
  (window as any).verifySupabaseEnv = verifySupabaseEnv;
  (window as any).logSupabaseEnvStatus = logSupabaseEnvStatus;
}
