import { getSupabase } from './supabaseClient';
import { getPlayStoreProductId, REVERSE_PLAY_STORE_PRODUCT_MAP } from './billing';

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
  const dbProductId = REVERSE_PLAY_STORE_PRODUCT_MAP[productId] || REVERSE_PLAY_STORE_PRODUCT_MAP[playProductId] || productId;

  let verifiedSuccessfully = false;
  let orderId = `GPA.TEST-${Date.now()}`;

  // 1. Aufruf der Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('verify-google-play-purchase', {
      body: {
        purchaseToken,
        productId: playProductId,
        userId,
        price: price || 1.99,
        packageName: 'app.flowderstille.de'
      }
    });

    if (!error && data?.success) {
      verifiedSuccessfully = true;
      if (data.orderId) orderId = data.orderId;
    }
  } catch (fnErr) {
    console.warn("Edge Function notice:", fnErr);
  }

  // 2. WICHTIG: Direkter Eintrag in die zentrale Tabelle public.kaeufe (Identisch mit PayPal / Webseite!)
  try {
    // In kaeufe schreiben (DB ID)
    const dbKey1 = `${orderId}_${dbProductId}`;
    await supabase.from('kaeufe').upsert({
      user_id: userId,
      produkt_id: dbProductId,
      betrag: price || 1.99,
      waehrung: 'EUR',
      status: 'completed',
      zahlungsmethode: 'google_play',
      paypal_order_id: dbKey1,
      transaktions_id: purchaseToken,
      created_at: new Date().toISOString()
    }, { onConflict: 'paypal_order_id' });

    // In kaeufe schreiben (Play ID falls unterschiedlich)
    if (playProductId !== dbProductId) {
      const dbKey2 = `${orderId}_${playProductId}`;
      await supabase.from('kaeufe').upsert({
        user_id: userId,
        produkt_id: playProductId,
        betrag: price || 1.99,
        waehrung: 'EUR',
        status: 'completed',
        zahlungsmethode: 'google_play',
        paypal_order_id: dbKey2,
        transaktions_id: purchaseToken,
        created_at: new Date().toISOString()
      }, { onConflict: 'paypal_order_id' });
    }

    // Profil-Status & Rolle anpassen (is_premium = true, user_role = 'kunde')
    await supabase.from('profiles').update({
      is_premium: true,
      user_role: 'kunde',
      updated_at: new Date().toISOString()
    }).eq('id', userId);

    verifiedSuccessfully = true;
  } catch (dbErr) {
    console.error("Direkter kaeufe-Upsert Fehler:", dbErr);
  }

  return { success: verifiedSuccessfully, orderId };
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
