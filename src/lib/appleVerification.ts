import { getSupabase } from './supabaseClient';
import { getStoreProductId } from './billing';
import { trackMetaPurchase } from './metaPixel';

interface VerifyApplePurchaseParams {
  transactionId: string;
  productId: string;
}

// Apple-Käufe werden ausschließlich serverseitig geprüft und gespeichert (verify-apple-purchase).
// Schlägt die Prüfung fehl, wird ein Fehler geworfen: Die Transaktion bleibt dann offen
// und StoreKit liefert sie beim nächsten App-Start erneut aus.
export const verifyApplePurchase = async ({ transactionId, productId }: VerifyApplePurchaseParams) => {
  const supabase = getSupabase();
  const storeProductId = getStoreProductId(productId);

  const { data, error } = await supabase.functions.invoke('verify-apple-purchase', {
    body: { transactionId, productId: storeProductId }
  });

  if (error || !data?.success) {
    throw new Error(data?.error || error?.message || 'Kauf konnte bei Apple nicht bestätigt werden.');
  }

  trackMetaPurchase({
    value: data.price || 1.99,
    currency: 'EUR',
    content_ids: [data.dbProductId],
    content_name: `App Store: ${data.dbProductId}`,
    content_type: 'app_in_app_purchase',
    platform: 'app'
  });

  return { success: true, orderId: data.orderId, productId: data.productId, price: data.price };
};
