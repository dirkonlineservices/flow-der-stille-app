import { getSupabase } from './supabaseClient';

interface AbandonedCheckoutParams {
  produkt: any;
  paymentMethod: 'PayPal' | 'Google Play';
  userEmail?: string | null;
  reason?: string;
}

export async function reportAbandonedCheckout({
  produkt,
  paymentMethod,
  userEmail,
  reason = 'Fenster vor Bezahlung geschlossen'
}: AbandonedCheckoutParams) {
  try {
    const supabase = getSupabase();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

    await supabase.functions.invoke('notify-abandoned-checkout', {
      body: {
        produktTitel: produkt?.titel || produkt?.title || produkt?.id || 'Unbekannt',
        produktId: produkt?.id || '',
        kategorie: produkt?.kategorie || 'Audio',
        preis: produkt?.preis || '1.99',
        pathname,
        paymentMethod,
        userEmail: userEmail || 'Gast (nicht eingeloggt)',
        reason
      }
    });
  } catch (err) {
    console.warn('[checkoutAbandonment] Notice:', err);
  }
}
