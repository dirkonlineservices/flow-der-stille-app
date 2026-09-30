import { getSupabase } from './supabaseClient';

interface ErrorReportOptions {
  context: string;
  error: any;
  userEmail?: string;
}

export async function reportCriticalError({ context, error, userEmail }: ErrorReportOptions) {
  const errMsg = (error?.message || String(error || '')).toLowerCase();

  // Unkritische Nutzer-Aktionen herausfiltern (z. B. PayPal Popup / Fenster vom Nutzer geschlossen)
  if (
    errMsg.includes('popup close') ||
    errMsg.includes('popup closed') ||
    errMsg.includes('window is closed') ||
    errMsg.includes('window was closed') ||
    errMsg.includes('window closed') ||
    errMsg.includes('can not determine type') ||
    errMsg.includes('cannot determine type') ||
    errMsg.includes('user_canceled') ||
    errMsg.includes('cancelled') ||
    errMsg.includes('abgebrochen')
  ) {
    console.info(`[INFO] Unkritischer Nutzer-Abbruch / Bezahlfenster geschlossen (${context}):`, errMsg);
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
