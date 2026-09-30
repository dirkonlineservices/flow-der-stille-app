// @ts-nocheck
// Supabase Edge Function: notify-abandoned-checkout
// Sendet bei einem Kaufabbruch im Bezahlfenster (PayPal / Google Play)
// sofort eine Push-Nachricht auf Telegram und eine Benachrichtigungs-E-Mail.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch (err) {
    console.warn('Telegram notification failed:', err)
    return false
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Flow der Stille Alert <kontakt@flow-der-stille.de>',
        to,
        subject,
        html,
      }),
    })
    return res.ok
  } catch (err) {
    console.warn('Email notification failed:', err)
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      produktTitel = 'Unbekanntes Produkt',
      produktId = '',
      kategorie = 'Audio',
      preis = '1.99',
      pathname = '/',
      paymentMethod = 'PayPal',
      userEmail = 'Gast (nicht eingeloggt)',
      reason = 'Fenster geschlossen'
    } = await req.json()

    const datum = new Date().toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const preisFormatiert = `${Number(preis).toFixed(2).replace('.', ',')} €`

    // 1. Telegram Push-Nachricht an den Betreiber
    await sendTelegram(`
⚠️ <b>Kaufabbruch im Bezahlfenster</b>

🎧 <b>Produkt:</b> ${produktTitel}
🏷 <b>Kategorie:</b> ${kategorie}
💶 <b>Preis:</b> ${preisFormatiert}
📍 <b>Seite:</b> <code>${pathname}</code>
💳 <b>Zahlungsart:</b> ${paymentMethod}
👤 <b>Nutzer:</b> ${userEmail}
ℹ️ <b>Grund:</b> ${reason}
🕒 <b>Zeitpunkt:</b> ${datum}
    `.trim())

    // 2. E-Mail-Zusammenfassung an info@flow-der-stille.de
    await sendEmail(
      'info@flow-der-stille.de',
      `⚠️ Kaufabbruch: ${produktTitel} (${preisFormatiert})`,
      `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff8f5; border: 1px solid #fed7aa; border-radius: 8px;">
          <h2 style="color: #c2410c; margin-top: 0;">⚠️ Kaufabbruch im Bezahlfenster</h2>
          <p style="color: #4b5563; font-size: 14px;">Ein Besucher hat den Bezahlvorgang gestartet, aber vor Abschluss abgebrochen.</p>
          
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 16px 0;">
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Produkt</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f3f4f6;">${produktTitel}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Kategorie</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f3f4f6;">${kategorie}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Preis</td>
              <td style="padding: 10px 14px; font-weight: bold; color: #c2410c; border-bottom: 1px solid #f3f4f6;">${preisFormatiert}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Aufgerufen auf</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f3f4f6; font-family: monospace;">${pathname}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Zahlungsart</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f3f4f6;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #f3f4f6;">Nutzer</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f3f4f6;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #374151;">Zeitpunkt</td>
              <td style="padding: 10px 14px;">${datum}</td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
            Tipp zur Conversion-Optimierung: Wenn dieses Produkt häufig abgebrochen wird, prüfe die Hörprobe oder die Beschreibung auf dieser Seite.
          </p>
        </div>
      `
    )

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('notify-abandoned-checkout error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
