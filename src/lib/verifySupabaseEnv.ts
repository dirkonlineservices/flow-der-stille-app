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

/**
 * Client-side verification script to check if VITE_SUPABASE_URL 
 * and VITE_SUPABASE_ANON_KEY are correctly loaded in the environment.
 */
export async function verifySupabaseEnv(): Promise<SupabaseEnvStatus> {
  const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const isPlaceholder = 
    rawUrl.includes('placeholder.supabase.co') || 
    rawKey === 'placeholder-key' ||
    !rawUrl || 
    !rawKey;

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

  // Attempt connection test
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

/**
 * Logs the verification output directly to the browser console.
 */
export async function logSupabaseEnvStatus(): Promise<void> {
  console.group('🔍 Supabase Environment Verification');
  
  const status = await verifySupabaseEnv();

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
}

// Make available globally on window for easy browser console verification
if (typeof window !== 'undefined') {
  (window as any).verifySupabaseEnv = verifySupabaseEnv;
  (window as any).logSupabaseEnvStatus = logSupabaseEnvStatus;
}
