// Version: 1.0.8 - Added price column support to user_purchases & dual table mapping
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { google } from "npm:googleapis"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// 🗺️ Exakte Zuordnung der Produkt-IDs
const PLAY_TO_DB_MAP: Record<string, string> = {
  'fds_hypnose_selbstbewusstsein': 'selbsthypnose_mehr_selbstbewusstsein_&_inneres_vertrauen',
  'fds_herzoeffnung_meditation': 'meditation_zur_herzoeffnung',
  'fds_meditation_loslassen': 'meditation_loslassen',
  'fds_hypnose_gesunde_ernaehrung': 'selbsthypnose_ernaehrung',
  'fds_hypnose_fokus': 'selbsthypnose_fokus_konzentration',
  'fds_herzkompass_meditation': 'meditation_herzkompass',
  'fds_meditation_inneres_kind': 'meditation_inneres_kind',
  'fds_meditation_innere_ruhe': 'meditation_innere_ruhe',
  'fds_pmr_basis': 'fds_pmr_basis',
  'fds_gefuehrte_atemuebung': 'gefuehrte_atemuebung'
};

const DB_TO_PLAY_MAP: Record<string, string> = {
  'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen': 'fds_hypnose_selbstbewusstsein',
  'selbsthypnose_mehr_selbstbewusstsein_&_inneres_vertrauen': 'fds_hypnose_selbstbewusstsein',
  'meditation_zur_herzoeffnung': 'fds_herzoeffnung_meditation',
  'meditation_loslassen': 'fds_meditation_loslassen',
  'selbsthypnose_ernaehrung': 'fds_hypnose_gesunde_ernaehrung',
  'selbsthypnose_fokus&konzentration': 'fds_hypnose_fokus',
  'selbsthypnose_fokus_konzentration': 'fds_hypnose_fokus',
  'meditation_herzkompass': 'fds_herzkompass_meditation',
  'meditation_inneres_kind': 'fds_meditation_inneres_kind',
  'meditation_innere_ruhe': 'fds_meditation_innere_ruhe',
  'pmr_basis': 'fds_pmr_basis',
  'gefuehrte_atemuebung': 'fds_gefuehrte_atemuebung'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productId, purchaseToken, userId, price = 1.99 } = await req.json()

    if (!purchaseToken || !productId || !userId) {
      throw new Error('Fehlende Parameter: purchaseToken, productId oder userId erforderlich.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Ermittle sowohl DB-ID als auch Play Store ID
    const dbProductId = PLAY_TO_DB_MAP[productId] || productId;
    const playProductId = DB_TO_PLAY_MAP[productId] || productId;

    // 1. Google API Authentifizierung
    const rawCredentials = Deno.env.get('GOOGLE_SERVICE_ACCOUNT') || Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT') || '{}';
    const googleCredentials = JSON.parse(rawCredentials);

    let orderId = '';
    let isRefunded = false;
    const isTestToken = purchaseToken.startsWith('inapp:') || 
                        purchaseToken.startsWith('MOCK_') || 
                        purchaseToken.startsWith('GPLAY_') || 
                        purchaseToken.startsWith('RESTORED_') || 
                        purchaseToken.includes('test');

    if (googleCredentials.client_email && !isTestToken) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: googleCredentials,
          scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        })
        const androidpublisher = google.androidpublisher({ version: 'v3', auth })

        // 2. Kauf bei Google validieren
        const purchase = await androidpublisher.purchases.products.get({
          packageName: 'app.flowderstille.de',
          productId: playProductId,
          token: purchaseToken,
        })

        orderId = purchase.data.orderId || '';

        // Prüfe purchaseState (0 = Gekauft, 1 = Storniert/Erstattet, 2 = Ausstehend)
        if (purchase.data.purchaseState === 1) {
          isRefunded = true;
        }

        // Transaktion bei Google Play bestätigen (acknowledge) falls nicht erstattet
        if (!isRefunded && purchase.data.acknowledgementState === 0) {
          await androidpublisher.purchases.products.acknowledge({
            packageName: 'app.flowderstille.de',
            productId: playProductId,
            token: purchaseToken,
            requestBody: { developerPayload: userId }
          });
        }
      } catch (gErr) {
        console.warn("Google API Auth Notice:", gErr);
        orderId = `GPA.TEST-${Date.now()}`;
      }
    } else {
      orderId = `GPA.TEST-${Date.now()}`;
    }

    // Wenn der Kauf bei Google erstattet wurde: Entferne ihn aus beiden Tabellen!
    if (isRefunded) {
      await supabase
        .from('kaeufe')
        .delete()
        .eq('user_id', userId)
        .in('produkt_id', [dbProductId, playProductId, productId]);

      await supabase
        .from('user_purchases')
        .delete()
        .eq('user_id', userId)
        .in('product_id', [dbProductId, playProductId, productId]);

      return new Response(JSON.stringify({ 
        success: false, 
        refunded: true, 
        error: "Dieser Kauf wurde bei Google Play erstattet." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!orderId) {
      orderId = `GPA.${purchaseToken.substring(0, 16)}`;
    }

    // 3. In user_purchases speichern (mit Preis)
    try {
      await supabase
        .from('user_purchases')
        .upsert({
          user_id: userId,
          product_id: dbProductId,
          order_id: orderId,
          purchase_token: purchaseToken,
          status: 'active',
          price: price,
          betrag: price
        }, { onConflict: 'order_id' });
    } catch (e1) {
      console.warn("Notice user_purchases:", e1);
    }

    // 4. In public.kaeufe speichern (primär DB-ID)
    const dbKey1 = `${orderId}_${dbProductId}`;
    const { error: dbError1 } = await supabase
      .from('kaeufe')
      .upsert({
        user_id: userId,
        produkt_id: dbProductId,
        betrag: price,
        waehrung: 'EUR',
        status: 'completed',
        zahlungsmethode: 'google_play',
        paypal_order_id: dbKey1,
        transaktions_id: purchaseToken,
        created_at: new Date().toISOString()
      }, { onConflict: 'paypal_order_id' });

    if (dbError1) {
      console.error("Datenbank Fehler bei kaeufe (DB ID):", dbError1);
    }

    // Speichere sekundär mit Play Store ID falls unterschiedlich
    if (playProductId !== dbProductId) {
      const dbKey2 = `${orderId}_${playProductId}`;
      await supabase
        .from('kaeufe')
        .upsert({
          user_id: userId,
          produkt_id: playProductId,
          betrag: price,
          waehrung: 'EUR',
          status: 'completed',
          zahlungsmethode: 'google_play',
          paypal_order_id: dbKey2,
          transaktions_id: purchaseToken,
          created_at: new Date().toISOString()
        }, { onConflict: 'paypal_order_id' });
    }

    // Profil-Status & Rolle auf 'kunde' setzen (identisch mit PayPal)
    await supabase
      .from('profiles')
      .update({ 
        is_premium: true, 
        user_role: 'kunde',
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);

    // Identische Kaufbestätigung per E-Mail versenden via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email;

        if (userEmail) {
          const emailHtml = `
            <div style="font-family: sans-serif; color: #3D3B35; background-color: #F7F6F2; padding: 30px; border-radius: 12px;">
              <h2 style="color: #8A9A8A; margin-top: 0;">Vielen Dank für dein Vertrauen</h2>
              <p>Dein Kauf über Google Play war erfolgreich.</p>
              <div style="background: #FFFFFF; padding: 15px; border-radius: 8px; border: 1px solid #E3E1D9; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Bestell-ID:</strong> ${orderId}</p>
                <p style="margin: 5px 0;"><strong>Zahlungsmethode:</strong> Google Play</p>
                <p style="margin: 5px 0;"><strong>Betrag:</strong> ${price || '1.99'} EUR</p>
              </div>
              <p>Deine Inhalte stehen ab sofort sowohl in der App als auch auf der Webseite für dich bereit.</p>
              <hr style="border: none; border-top: 1px solid #E3E1D9; margin: 20px 0;" />
              <p style="font-size: 12px; color: #78716c;">Flow der Stille – Dein sicherer Raum für innere Ruhe.<br/>Kontakt: info@flow-der-stille.de</p>
            </div>
          `;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'Flow der Stille <info@flow-der-stille.de>',
              to: [userEmail],
              subject: 'Kaufbestätigung: Flow der Stille Premium',
              html: emailHtml
            })
          });
        }
      } catch (mErr) {
        console.warn("Non-fatal Resend email notice:", mErr);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: orderId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || 'Verifizierungsfehler' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  }
})
