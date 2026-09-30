import { getSupabase } from './supabaseClient';

interface ErrorReportOptions {
  context: string;
  error: any;
  userEmail?: string;
}

export async function reportCriticalError({ context, error, userEmail }: ErrorReportOptions) {
  const errMsg = error?.message || String(error || '');

  // Unkritische Nutzer-Aktionen herausfiltern (z. B. PayPal Popup vom Nutzer geschlossen)
  if (
    errMsg.includes('Detected popup close') ||
    errMsg.includes('popup close') ||
    errMsg.includes('Window was closed') ||
    errMsg.includes('user_canceled') ||
    errMsg.includes('cancelled')
  ) {
    console.info(`[INFO] Nutzer hat Bezahlfenster geschlossen (${context}):`, errMsg);
    return;
  }

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
