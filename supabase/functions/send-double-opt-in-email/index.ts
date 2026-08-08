// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const bodyText = await req.text();
    if (!bodyText) throw new Error("Request Body leer");
    
    const { email, confirm_token } = JSON.parse(bodyText);

    if (!email || !confirm_token) {
      throw new Error("Daten unvollständig");
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error("API Key fehlt");

    const confirmUrl = `https://flow-der-stille.de/newsletter-bestaetigt?email=${encodeURIComponent(email)}&token=${confirm_token}`;

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f0; padding: 40px 20px; color: #3D3B35;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Georgia', serif; color: #8A9A8A; font-size: 28px; font-weight: normal; margin: 0; letter-spacing: 0.5px;">Flow der Stille</h1>
        </div>
        
        <div style="background-color: #FFFFFF; padding: 40px 30px; border-radius: 12px; border: 1px solid #E3E1D9; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="font-family: 'Georgia', serif; color: #8A9A8A; font-size: 24px; font-weight: normal; margin-top: 0; margin-bottom: 24px; text-align: center;">Newsletter Anmeldung bestätigen</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #695C4D; margin-bottom: 32px; text-align: center;">
            Bitte bestätige kurz deine Adresse, um in Zukunft Impulse für mehr innere Ruhe zu erhalten.
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${confirmUrl}" style="background-color: #8A9A8A; color: #FFFFFF; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 8px; display: inline-block; line-height: 100%;">Anmeldung bestätigen</a>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #695C4D; text-align: center; margin-bottom: 0;">
            Falls der Button klemmt, kopiere diesen Link in deinen Browser:<br>
            <a href="${confirmUrl}" style="color: #8A9A8A; word-break: break-all;">${confirmUrl}</a>
          </p>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Flow der Stille <info@flow-der-stille.de>',
        to: [email],
        subject: 'Newsletter Anmeldung bestätigen',
        html: emailHtml
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Fehler bei Resend: ${errText}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 } 
    )
  }
})
