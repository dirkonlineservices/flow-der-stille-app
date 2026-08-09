import { getSupabase } from './supabaseClient';

interface VerifyPurchaseParams {
  purchaseToken: string;
  productId: string;
  userId: string;
  price: number; // Beispiel: 1.99 oder 4.99
}

export const verifyGooglePlayPurchase = async ({
  purchaseToken,
  productId,
  userId,
  price
}: VerifyPurchaseParams) => {
  const supabase = getSupabase();

  // 1. Edge Function aufrufen (verify-google-play-purchase)
  const { data, error } = await supabase.functions.invoke('verify-google-play-purchase', {
    body: {
      purchaseToken,
      productId,
      userId,
      packageName: 'de.flowderstille.app'
    }
  });

  if (error || !data?.success) {
    throw new Error(error?.message || data?.error || 'Kauf konnte nicht verifiziert werden.');
  }

  // 2. DataLayer Event für GA4 mit dynamischem Preis
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: purchaseToken,
        value: price,
        currency: 'EUR',
        items: [{
          item_id: productId,
          item_name: 'Flow der Stille Premium',
          price: price
        }]
      }
    });
  }

  return data;
};
