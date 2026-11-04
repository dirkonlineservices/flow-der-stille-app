import { getSupabase } from './supabaseClient';
import { getPlayStoreProductId, REVERSE_PLAY_STORE_PRODUCT_MAP } from './billing';
import { trackMetaPurchase } from './metaPixel';

interface VerifyPurchaseParams {
  purchaseToken: string;
  productId: string;
  price: number;
}

// Google-Play-Käufe werden ausschließlich serverseitig geprüft und gespeichert (verify-google-play-purchase).
// Schlägt die Prüfung fehl, wird ein Fehler geworfen: Die Transaktion bleibt dann unbestätigt
// und wird beim nächsten App-Start erneut geprüft.
export const verifyGooglePlayPurchase = async ({
  purchaseToken,
  productId,
  price
}: VerifyPurchaseParams) => {
  const supabase = getSupabase();
  const playProductId = getPlayStoreProductId(productId);
  const dbProductId = REVERSE_PLAY_STORE_PRODUCT_MAP[productId] || REVERSE_PLAY_STORE_PRODUCT_MAP[playProductId] || productId;

  const { data, error } = await supabase.functions.invoke('verify-google-play-purchase', {
    body: {
      purchaseToken,
      productId: playProductId,
      price: price || 1.99,
      packageName: 'app.flowderstille.de'
    }
  });

  if (error || !data?.success) {
    throw new Error(data?.error || error?.message || 'Kauf konnte bei Google Play nicht bestätigt werden.');
  }

  // Meta Pixel In-App Purchase Event mit Plattform-Tag
  trackMetaPurchase({
    value: price || 1.99,
    currency: 'EUR',
    content_ids: [dbProductId],
    content_name: `Google Play: ${dbProductId}`,
    content_type: 'app_in_app_purchase',
    platform: 'app'
  });

  return { success: true, orderId: data.orderId };
};

export interface GooglePlayPurchase {
  purchaseToken: string;
  productId: string;
  price: number;
}

export const handlePurchaseSuccess = async (purchase: GooglePlayPurchase) => {
  return await verifyGooglePlayPurchase(purchase);
};
