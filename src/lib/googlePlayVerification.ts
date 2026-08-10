import { getSupabase } from './supabaseClient';
import { getPlayStoreProductId } from './billing';

interface VerifyPurchaseParams {
  purchaseToken: string;
  productId: string;
  userId: string;
  price: number;
}

export const verifyGooglePlayPurchase = async ({
  purchaseToken,
  productId,
  userId,
  price
}: VerifyPurchaseParams) => {
  const supabase = getSupabase();
  const playProductId = getPlayStoreProductId(productId);

  // 1. Primärer Aufruf der Edge Function (verify-google-play-purchase)
  let { data, error } = await supabase.functions.invoke('verify-google-play-purchase', {
    body: {
      purchaseToken,
      productId: playProductId,
      userId,
      price: price || 1.99,
      packageName: 'app.flowderstille.de'
    }
  });

  // Fallback auf google-play-purchase falls primäre Funktion nicht antwortet
  if (error || !data?.success) {
    const fallbackRes = await supabase.functions.invoke('google-play-purchase', {
      body: {
        purchaseToken,
        productId: playProductId,
        userId,
        price: price || 1.99,
        packageName: 'app.flowderstille.de'
      }
    });
    if (!fallbackRes.error && fallbackRes.data?.success) {
      data = fallbackRes.data;
      error = null;
    }
  }

  if (error || !data?.success) {
    throw new Error(error?.message || data?.error || 'Kauf konnte von Supabase nicht verifiziert werden.');
  }

  return data;
};

export interface GooglePlayPurchase {
  purchaseToken: string;
  productId: string;
  price: number;
}

export const handlePurchaseSuccess = async (purchase: GooglePlayPurchase, userId: string) => {
  return await verifyGooglePlayPurchase({
    purchaseToken: purchase.purchaseToken,
    productId: purchase.productId,
    userId: userId,
    price: purchase.price
  });
};
