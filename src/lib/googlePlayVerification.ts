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

  // 1. Edge Function aufrufen (verify-google-play-purchase)
  const { data, error } = await supabase.functions.invoke('verify-google-play-purchase', {
    body: {
      purchaseToken,
      productId: playProductId,
      userId,
      price: price || 1.99,
      packageName: 'app.flowderstille.de'
    }
  });

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
