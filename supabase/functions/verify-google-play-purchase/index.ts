import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleAuth } from 'https://esm.sh/google-auth-library@8.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { purchaseToken, productId, userId, packageName = 'app.flowderstille.de' } = await req.json();

    if (!purchaseToken || !productId || !userId) {
      throw new Error('Fehlende Parameter: purchaseToken, productId oder userId erforderlich.');
    }

    const serviceAccountRaw = Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT');
    if (!serviceAccountRaw) {
      throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT Secret fehlt in Supabase.');
    }
    const serviceAccount = JSON.parse(serviceAccountRaw);

    const auth = new GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const googleApiUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;
    
    const googleRes = await fetch(googleApiUrl, {
      headers: { Authorization: `Bearer ${accessToken.token}` },
    });

    const googleData = await googleRes.json();

    if (!googleRes.ok) {
      throw new Error(`Google API Fehler: ${googleData.error?.message || 'Token ungueltig'}`);
    }

    const isPurchaseValid = googleData.paymentState === 1 || googleData.acknowledgementState === 1;

    if (!isPurchaseValid) {
      return new Response(
        JSON.stringify({ success: false, message: 'Kauf ist nicht aktiv oder wurde storniert.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_premium: true, 
        premium_type: productId,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);

    if (dbError) throw dbError;

    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      provider: 'google_play',
      product_id: productId,
      purchase_token: purchaseToken,
      status: 'SUCCESS'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Abo erfolgreich verifiziert',
        productId,
        expiryTimeMillis: googleData.expiryTimeMillis 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
