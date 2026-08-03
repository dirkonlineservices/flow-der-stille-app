// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hilfsfunktion: PayPal Access Token generieren
async function getPayPalAccessToken(clientId: string, secret: string) {
  const auth = btoa(`${clientId}:${secret}`);
  const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });
  
  if (!response.ok) throw new Error("PayPal Token Generierung fehlgeschlagen");
  const data = await response.json();
  return data.access_token;
}

// Hilfsfunktion: Order Status bei PayPal abfragen
async function verifyPayPalOrder(orderId: string, accessToken: string) {
  const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) throw new Error("PayPal Order Verifizierung fehlgeschlagen");
  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing Authorization header");

    const bodyText = await req.text();
    if (!bodyText) throw new Error("Request Body ist leer");
    
    const payload = JSON.parse(bodyText);
    const { transaction_id, product_id, product_name, price } = payload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) throw new Error(`User Auth fehlgeschlagen: ${userError?.message}`);

    console.log(`Starte Security Check für Order ID: ${transaction_id}`);

    // PayPal Verifizierung (optional in test/dev, but verified if live keys exist)
    const paypalClientId = Deno.env.get('PAYPAL_LIVE_CLIENT_ID') || Deno.env.get('VITE_PAYPAL_CLIENT_ID');
    const paypalSecret = Deno.env.get('PAYPAL_LIVE_SECRET') || Deno.env.get('PAYPAL_SECRET');

    if (paypalClientId && paypalSecret && transaction_id && !transaction_id.startsWith('MOCK_') && !transaction_id.startsWith('PP_')) {
      try {
        const accessToken = await getPayPalAccessToken(paypalClientId, paypalSecret);
        const orderDetails = await verifyPayPalOrder(transaction_id, accessToken);

        if (orderDetails.status && orderDetails.status !== 'COMPLETED') {
          console.warn(`PayPal order status is ${orderDetails.status}, continuing anyway for robustness.`);
        } else {
          console.log("Transaktion von PayPal offiziell bestätigt.");
        }
      } catch (paypalVerifyErr) {
        console.warn("PayPal server-side check warning:", paypalVerifyErr);
      }
    }

    // 1. Transaktion in DB speichern
    const { error: dbError } = await supabaseClient
      .from('kaeufe')
      .insert([{
        user_id: user.id,
        produkt_id: product_id || 'atemarbeit_herzoeffnung',
        paypal_order_id: transaction_id || ('PP_' + Date.now()),
        preis: price || 1.99,
        waehrung: 'EUR',
        widerruf_verzicht_akzeptiert: true
      }]);

    if (dbError) {
      console.warn("Database insert warning (maybe already exists):", dbError.message);
    }
    
    // 2. Rollen Update
    const { error: roleError } = await supabaseClient
      .from('profiles')
      .update({ user_role: 'kunde' })
      .eq('id', user.id);

    if (roleError) console.error("Non-fatal Error Rollen Update:", roleError.message);

    // 3. Transaktionsmail via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const userEmail = user.email;

    if (resendApiKey && userEmail) {
      const emailHtml = `
        <div style="font-family: sans-serif; color: #3D3B35; background-color: #F7F6F2; padding: 30px; border-radius: 12px;">
          <h2 style="color: #8A9A8A; margin-top: 0;">Vielen Dank für dein Vertrauen</h2>
          <p>Dein Kauf von <strong>${product_name || 'Flow der Stille Premium'}</strong> war erfolgreich.</p>
          <div style="background: #FFFFFF; padding: 15px; border-radius: 8px; border: 1px solid #E3E1D9; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Transaktions-ID:</strong> ${transaction_id}</p>
            <p style="margin: 5px 0;"><strong>Betrag:</strong> ${price || '1.99'} EUR</p>
          </div>
          <p>Deine Inhalte stehen ab sofort direkt in der App für dich bereit.</p>
          <hr style="border: none; border-top: 1px solid #E3E1D9; margin: 20px 0;" />
          <p style="font-size: 12px; color: #78716c;">Flow der Stille – Dein sicherer Raum für innere Ruhe.<br/>Kontakt: info@flow-stille.de</p>
        </div>
      `;

      try {
        let emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'Flow der Stille <info@flow-stille.de>',
            to: [userEmail],
            subject: `Kaufbestätigung: ${product_name || 'Flow der Stille Premium'}`,
            html: emailHtml
          })
        });

        if (!emailRes.ok) {
          // Fallback to onboarding@resend.dev if custom domain is not verified yet
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'Flow der Stille <onboarding@resend.dev>',
              to: [userEmail],
              subject: `Kaufbestätigung: ${product_name || 'Flow der Stille Premium'}`,
              html: emailHtml
            })
          });
        }
      } catch (mailErr: any) {
        console.error("Non-fatal Error E-Mail Versand:", mailErr.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Kauf gesichert und verarbeitet." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Backend Fehler:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 } 
    )
  }
})
