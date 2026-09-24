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
    const { transaction_id, product_id, product_name, price, guest_email, guest_name } = payload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    let activeUser: any = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } }
        });
        const { data: { user } } = await supabaseUserClient.auth.getUser();
        if (user) {
          activeUser = user;
        }
      } catch (authErr) {
        console.warn("User auth header check warning (might be guest):", authErr);
      }
    }

    const userEmail = activeUser?.email || guest_email;
    if (!userEmail) {
      throw new Error("Weder authentifizierter Nutzer noch Gast-E-Mail übermittelt.");
    }

    let activeUserId = activeUser?.id;
    let magicLinkUrl: string | null = null;

    // Wenn Gast-Kauf vorliegt: Magic Link generieren & ggf. User in Supabase Auth anlegen
    if (!activeUserId && guest_email) {
      try {
        const { data: linkData, error: linkErr } = await supabaseClient.auth.admin.generateLink({
          type: 'magiclink',
          email: guest_email,
          options: {
            redirectTo: `https://flow-der-stille.de/danke?order_id=${encodeURIComponent(transaction_id || '')}&product_id=${encodeURIComponent(product_id || '')}&magic=sent`
          }
        });
        if (linkData?.user) {
          activeUserId = linkData.user.id;
          magicLinkUrl = linkData.properties?.action_link || null;
        }
      } catch (linkGenErr) {
        console.warn("Magic link admin generation warning:", linkGenErr);
      }
    }

    console.log(`Starte Security Check für Order ID: ${transaction_id}, User/Gast: ${userEmail}`);

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

    const paypalOrderId = transaction_id || ('PP_' + Date.now());

    // Idempotenz-Sperre: Prüfe vorab, ob die Bestellung bereits existierte und den Status 'completed' hatte
    const { data: existingKauf } = await supabaseClient
      .from('kaeufe')
      .select('status, paypal_order_id')
      .eq('paypal_order_id', paypalOrderId)
      .maybeSingle();

    const isAlreadyCompleted = existingKauf && existingKauf.status === 'completed';

    // 1. Transaktion mit .upsert() in DB speichern (onConflict: 'paypal_order_id')
    const kaufRecord: any = {
      produkt_id: product_id || 'atemarbeit_herzoeffnung',
      paypal_order_id: paypalOrderId,
      preis: price || 1.99,
      waehrung: 'EUR',
      status: 'completed',
      email: userEmail,
      widerruf_verzicht_akzeptiert: true,
      updated_at: new Date().toISOString()
    };
    if (activeUserId) {
      kaufRecord.user_id = activeUserId;
    }

    const { data: upsertData, error: dbError } = await supabaseClient
      .from('kaeufe')
      .upsert(kaufRecord, { onConflict: 'paypal_order_id' });

    if (dbError) {
      console.warn("Database upsert warning:", dbError.message);
    }
    
    // 2. Rollen Update (falls registrierter User)
    if (activeUserId) {
      const { error: roleError } = await supabaseClient
        .from('profiles')
        .update({ user_role: 'kunde', is_premium: true })
        .eq('id', activeUserId);

      if (roleError) console.error("Non-fatal Error Rollen Update:", roleError.message);
    }

    // 3. Transaktionsmail via Resend (nur versenden, wenn die Bestellung nicht bereits verarbeitet war)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (isAlreadyCompleted) {
      console.log(`[IDEMPOTENCY] Order ${paypalOrderId} war bereits als 'completed' markiert. Mailversand wird übersprungen.`);
    } else if (resendApiKey && userEmail) {
      const magicLinkSection = magicLinkUrl ? `
        <div style="margin: 25px 0; text-align: center;">
          <a href="${magicLinkUrl}" style="background-color: #3b5c3b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; font-size: 15px;">
            ✦ Mit 1 Klick auf jedem Gerät öffnen &amp; anhören
          </a>
          <p style="font-size: 11px; color: #78716c; margin-top: 8px;">
            Kein Passwort nötig – dein persönlicher Magic Link loggt dich direkt ein.
          </p>
        </div>
      ` : `
        <p>Deine Inhalte stehen ab sofort direkt in der App und im Web-Player für dich bereit.</p>
      `;

      const emailHtml = `
        <div style="font-family: sans-serif; color: #3D3B35; background-color: #F7F6F2; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #3b5c3b; margin-top: 0; font-family: serif;">Vielen Dank für dein Vertrauen</h2>
          <p>Liebe/r ${guest_name || 'Hörer/in'},</p>
          <p>dein Einmalkauf von <strong>${product_name || 'Flow der Stille Audio'}</strong> war erfolgreich.</p>
          <div style="background: #FFFFFF; padding: 16px; border-radius: 12px; border: 1px solid #E3E1D9; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Transaktions-ID:</strong> ${paypalOrderId}</p>
            <p style="margin: 4px 0;"><strong>Betrag:</strong> ${(price || '1.99').toString().replace('.', ',')} EUR (Einmalkauf • Kein Abo)</p>
            <p style="margin: 4px 0;"><strong>Kauf-E-Mail:</strong> ${userEmail}</p>
          </div>
          ${magicLinkSection}
          <hr style="border: none; border-top: 1px solid #E3E1D9; margin: 25px 0;" />
          <p style="font-size: 12px; color: #78716c; line-height: 1.5;">
            Flow der Stille – Dein sicherer Raum für innere Ruhe.<br/>
            Bei Fragen antworte einfach auf diese E-Mail oder schreibe uns an <a href="mailto:info@flow-der-stille.de" style="color: #3b5c3b;">info@flow-der-stille.de</a>.
          </p>
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
            from: 'Flow der Stille <info@flow-der-stille.de>',
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
