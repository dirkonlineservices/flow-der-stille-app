import { getSupabase } from './supabaseClient';

interface ErrorReportOptions {
  context: string;
  error: any;
  userEmail?: string;
}

export async function reportCriticalError({ context, error, userEmail }: ErrorReportOptions) {
  console.error(`[CRITICAL ERROR] ${context}:`, error);

  try {
    const supabase = getSupabase();
    await supabase.functions.invoke('send-error-alert', {
      body: {
        context,
        errorMessage: error?.message || String(error),
        errorDetails: error,
        userEmail: userEmail || 'Nicht angegeben'
      }
    });
  } catch (loggingError) {
    console.error('Fehler beim Senden der Benachrichtigung:', loggingError);
  }
}
