// Version: 1.1.1 - Fixed kaeufe column name 'preis' & onConflict 'user_id,produkt_id'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { google } from "https://esm.sh/googleapis@126.0.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// 🗺️ Exakte Zuordnung der Produkt-IDs (Play Store ID <-> Supabase DB ID)
const PLAY_TO_DB_MAP: Record<string, string> = {
  'fds_hypnose_selbstbewusstsein': 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen',
  'fds_herzoeffnung_meditation': 'meditation_zur_herzoeffnung',
  'fds_meditation_loslassen': 'meditation_loslassen',
  'fds_hypnose_gesunde_ernaehrung': 'selbsthypnose_ernaehrung',
  'fds_hypnose_fokus': 'selbsthypnose_fokus&konzentration',
  'fds_herzkompass_meditation': 'meditation_herzkompass',
  'fds_meditation_inneres_kind': 'meditation_inneres_kind',
  'fds_meditation_innere_ruhe': 'meditation_innere_ruhe',
  'fds_pmr_basis': 'pmr_basis',
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
                        purchaseToken.includes('test') ||
                        purchaseToken.includes('TEST');

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

        // Transaktion bei Google Play zwingend bestätigen (acknowledge)
        if (!isRefunded && purchase.data.acknowledgementState === 0) {
          try {
            await androidpublisher.purchases.products.acknowledge({
              packageName: 'app.flowderstille.de',
              productId: playProductId,
              token: purchaseToken,
              requestBody: { developerPayload: userId }
            });
          } catch (ackErr) {
            console.warn("Acknowledge Notice:", ackErr);
          }
        }
      } catch (gErr) {
        console.warn("Google API Auth Notice:", gErr);
        const cleanToken = purchaseToken.replace(/[^a-zA-Z0-9]/g, '').slice(-8) || 'TEST';
        orderId = `GPA.TEST-${dbProductId}-${cleanToken}`;
      }
    } else {
      const cleanToken = purchaseToken.replace(/[^a-zA-Z0-9]/g, '').slice(-8) || 'TEST';
      orderId = `GPA.TEST-${dbProductId}-${cleanToken}`;
    }

    // Wenn der Kauf bei Google erstattet wurde: Entferne ihn aus public.kaeufe!
    if (isRefunded) {
      await supabase
        .from('kaeufe')
        .delete()
        .eq('user_id', userId)
        .in('produkt_id', [dbProductId, playProductId, productId]);

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

    // Fetch user's email to see if an alias account (@gmail.com <-> @googlemail.com) exists
    let userEmail: string | undefined;
    const targetUserIds: string[] = [userId];

    try {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      userEmail = userData?.user?.email;

      if (userEmail) {
        const cleanEmail = userEmail.toLowerCase().trim();
        let aliasEmail: string | null = null;
        if (cleanEmail.endsWith('@gmail.com')) {
          aliasEmail = cleanEmail.replace('@gmail.com', '@googlemail.com');
        } else if (cleanEmail.endsWith('@googlemail.com')) {
          aliasEmail = cleanEmail.replace('@googlemail.com', '@gmail.com');
        }

        if (aliasEmail) {
          const { data: aliasProfiles } = await supabase
            .from('profiles')
            .select('id')
            .in('email', [cleanEmail, aliasEmail]);

          if (aliasProfiles && aliasProfiles.length > 0) {
            aliasProfiles.forEach((p: any) => {
              if (p.id && !targetUserIds.includes(p.id)) {
                targetUserIds.push(p.id);
              }
            });
          }
        }
      }
    } catch (uErr) {
      console.warn("Could not fetch user email for alias matching:", uErr);
    }

    // 🔒 Idempotenz-Sperre: Prüfe vorab, ob dieser Kauf bereits existiert
    const { data: existingKauf } = await supabase
      .from('kaeufe')
      .select('id')
      .in('user_id', targetUserIds)
      .in('produkt_id', [dbProductId, playProductId, productId])
      .maybeSingle();

    const isAlreadyPurchased = !!existingKauf;

    // 3. In der zentralen Datenbank-Tabelle public.kaeufe speichern mit Spalte 'preis' & onConflict: 'user_id,produkt_id'
    const purchasesToInsert = targetUserIds.map((uid, idx) => ({
      user_id: uid,
      produkt_id: dbProductId,
      preis: price,
      waehrung: 'EUR',
      paypal_order_id: `${orderId}_${dbProductId}_${idx}`,
      created_at: new Date().toISOString(),
      widerruf_verzicht_akzeptiert: true
    }));

    const { error: dbError1 } = await supabase
      .from('kaeufe')
      .upsert(purchasesToInsert, { onConflict: 'user_id,produkt_id' });

    if (dbError1) {
      console.error("Datenbank Fehler bei kaeufe (DB ID):", dbError1);
    }

    // Profil-Status auf is_premium = true setzen für alle verknüpften Accounts
    await supabase
      .from('profiles')
      .update({ 
        is_premium: true, 
        updated_at: new Date().toISOString() 
      })
      .in('id', targetUserIds);

    // 📩 Kaufbestätigung per E-Mail versenden via Resend (NUR bei echten NEUKÄUFEN! Keine Test-Token, keine Duplikate!)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && userEmail && !isAlreadyPurchased && !isTestToken) {
      try {
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
      } catch (mErr) {
        console.warn("Non-fatal Resend email notice:", mErr);
      }
    } else if (isAlreadyPurchased) {
      console.log(`[IDEMPOTENCY] Product ${dbProductId} for user ${userId} was already purchased. Resend email skipped.`);
    } else if (isTestToken) {
      console.log(`[TEST_TOKEN] Test token processed. Resend email skipped.`);
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
