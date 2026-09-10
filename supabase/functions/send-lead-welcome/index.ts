// Edge Function: send-lead-welcome
// Handles welcoming Meta/Facebook/Instagram leads via Resend & saves to newsletter_leads

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const sbUrl = Deno.env.get('SUPABASE_URL');
    const sbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY fehlt in den Secrets' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await req.json();
    const leads = Array.isArray(payload.leads) ? payload.leads : [payload];

    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ error: 'Keine Leads angegeben' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results = [];

    for (const lead of leads) {
      const email = (lead.email || '').trim().toLowerCase();
      const rawName = (lead.name || lead.fullName || '').trim();
      const firstName = lead.firstName || (rawName ? rawName.split(' ')[0] : 'lieber Ruhe-Suchender');

      if (!email) {
        results.push({ email: 'unknown', success: false, error: 'Email fehlt' });
        continue;
      }

      // 1. In Supabase speichern (Tabelle: newsletter_leads via PostgREST)
      let dbSaved = false;
      if (sbUrl && sbKey) {
        try {
          const dbRes = await fetch(`${sbUrl}/rest/v1/newsletter_leads`, {
            method: 'POST',
            headers: {
              'apikey': sbKey,
              'Authorization': `Bearer ${sbKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              email,
              status: 'meta_lead_contacted',
              source: 'facebook_lead_ad',
              updated_at: new Date().toISOString()
            })
          });
          dbSaved = dbRes.ok;
          if (!dbRes.ok) {
            const errText = await dbRes.text();
            console.warn(`[send-lead-welcome] DB Fehler bei ${email}:`, errText);
          }
        } catch (dbErr) {
          console.warn(`[send-lead-welcome] DB Ausnahme bei ${email}:`, dbErr.message);
        }
      }

      // 2. Registrierungslink mit vorbefüllter E-Mail und Vorname
      const registerUrl = `https://www.flow-der-stille.de/register?email=${encodeURIComponent(email)}&name=${encodeURIComponent(firstName)}`;

      const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Dein persönlicher Raum der Stille</title>
</head>
<body style="margin:0; padding:0; background-color:#FAF9F5; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#3D3B35;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAF9F5; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Brand Header -->
        <table role="presentation" width="100%" style="max-width: 580px; margin-bottom: 24px;">
          <tr>
            <td align="center">
              <h1 style="font-family:'Georgia', serif; font-size: 28px; font-weight: normal; color: #5B6E5B; margin: 0; letter-spacing: 0.5px;">Flow der Stille</h1>
              <p style="font-size: 13px; color: #8A9A8A; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Achtsamkeit &amp; Innere Ruhe</p>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E8E6DF; box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 40px 36px;">
              <h2 style="font-family:'Georgia', serif; font-size: 22px; font-weight: normal; color: #3D3B35; margin-top: 0; margin-bottom: 20px;">
                Hallo ${firstName}, 🌿
              </h2>
              
              <p style="font-size: 15px; line-height: 1.65; color: #55524B; margin-bottom: 18px;">
                wir haben deine Anfrage über Facebook &amp; Instagram erhalten und freuen uns von Herzen, dass du den Impuls für mehr innere Ruhe, Gelassenheit und bewusste Erholung setzt!
              </p>

              <p style="font-size: 15px; line-height: 1.65; color: #55524B; margin-bottom: 28px;">
                Um deinen persönlichen Raum der Stille freizuschalten und deine Übungen und Meditationen zu sichern (und ganz nebenbei auch aus Datenschutz- und Haftungsgründen), fehlt nur noch ein kleiner Schritt:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 30px auto;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #5B6E5B;">
                    <a href="${registerUrl}" target="_blank" style="font-size: 16px; font-weight: bold; color: #FFFFFF; text-decoration: none; padding: 15px 34px; display: inline-block; border-radius: 10px; line-height: 100%;">
                      Kostenlosen Zugang jetzt freischalten &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #7D7A72; text-align: center; margin-bottom: 30px;">
                <em>(Deine Daten sind dort bereits für dich hinterlegt – du vergibst einfach kurz dein persönliches Wunschpasswort).</em>
              </p>

              <hr style="border: none; border-top: 1px solid #ECEAE4; margin: 28px 0;" />

              <!-- App Info Box -->
              <div style="background-color: #F8F7F3; border-radius: 12px; padding: 18px 20px; margin-bottom: 28px; border-left: 4px solid #8A9A8A;">
                <p style="font-size: 14px; line-height: 1.6; color: #4A4740; margin: 0;">
                  <strong>📱 Wie du Flow der Stille nutzen kannst:</strong><br />
                  &bull; <strong>Im Web:</strong> Direkt auf jedem Smartphone, Tablet oder PC im Browser.<br />
                  &bull; <strong>Als Android-App:</strong> Unsere offizielle App findest du bereits im Google Play Store.<br />
                  &bull; <strong>Für Apple-Nutzer:</strong> Die iOS-Version für iPhone befindet sich aktuell im Feinschliff und erscheint voraussichtlich im November.
                </p>
              </div>

              <p style="font-size: 15px; line-height: 1.65; color: #55524B; margin-bottom: 28px;">
                Wir freuen uns riesig darauf, dich auf deiner Reise zu mehr Gelassenheit und Wohlbefinden zu begleiten!
              </p>

              <p style="font-size: 15px; line-height: 1.5; color: #3D3B35; margin: 0;">
                Herzliche Grüße<br />
                <strong style="color: #5B6E5B;">Lisa, Jacqueline &amp; Dirk</strong><br />
                <span style="font-size: 13px; color: #7D7A72;">Dein Team von Flow der Stille 🌿</span>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 580px; margin-top: 24px;">
          <tr>
            <td align="center" style="font-size: 12px; line-height: 1.6; color: #9E9B93;">
              Flow der Stille &bull; <a href="https://www.flow-der-stille.de" style="color: #8A9A8A; text-decoration: none;">www.flow-der-stille.de</a><br />
              <a href="https://www.flow-der-stille.de/datenschutz" style="color: #9E9B93; text-decoration: underline;">Datenschutz</a> &bull; 
              <a href="https://www.flow-der-stille.de/impressum" style="color: #9E9B93; text-decoration: underline;">Impressum</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const textContent = `Hallo ${firstName}, 🌿\n\nwir haben deine Anfrage über Facebook & Instagram erhalten und freuen uns von Herzen, dass du den Impuls für mehr innere Ruhe, Gelassenheit und bewusste Erholung setzt!\n\nUm deinen persönlichen Raum der Stille freizuschalten und deine Übungen und Meditationen zu sichern (und ganz nebenbei auch aus Datenschutz- und Haftungsgründen), fehlt nur noch ein kleiner Schritt:\n\n👉 Kostenlosen Zugang jetzt freischalten:\n${registerUrl}\n\n(Deine Daten sind dort bereits für dich hinterlegt – du vergibst einfach kurz dein persönliches Wunschpasswort).\n\n---\n\n📱 Wie du Flow der Stille nutzen kannst:\n• Im Web: Direkt auf jedem Smartphone, Tablet oder PC im Browser.\n• Als Android-App: Unsere offizielle App findest du bereits im Google Play Store.\n• Für Apple-Nutzer: Die iOS-Version für iPhone befindet sich aktuell im Feinschliff und erscheint voraussichtlich im November.\n\nWir freuen uns riesig darauf, dich auf deiner Reise zu mehr Gelassenheit und Wohlbefinden zu begleiten!\n\nHerzliche Grüße\nLisa, Jacqueline & Dirk\nDein Team von Flow der Stille 🌿\n\n---\nFlow der Stille\nhttps://www.flow-der-stille.de`;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'Flow der Stille <kontakt@flow-der-stille.de>',
            to: email,
            bcc: ['info@flow-der-stille.de'],
            subject: 'Dein persönlicher Raum der Stille wartet auf dich 🌿',
            html: htmlContent,
            text: textContent
          })
        });

        const resData = await res.json();
        if (res.ok) {
          console.log(`[send-lead-welcome] E-Mail erfolgreich an ${email} gesendet (ID: ${resData.id})`);
          results.push({ email, name: firstName, success: true, id: resData.id, dbSaved });
        } else {
          console.error(`[send-lead-welcome] Fehler bei ${email}:`, resData);
          results.push({ email, name: firstName, success: false, error: resData, dbSaved });
        }
      } catch (sendErr) {
        console.error(`[send-lead-welcome] Ausnahme bei ${email}:`, sendErr.message);
        results.push({ email, name: firstName, success: false, error: sendErr.message, dbSaved });
      }
    }

    return new Response(JSON.stringify({ success: true, count: results.length, results }, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[send-lead-welcome] Globaler Fehler:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
