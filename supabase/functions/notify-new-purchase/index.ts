// @ts-nocheck
// Supabase Edge Function: notify-new-purchase
// Wird per Database Webhook bei INSERT auf public.kaeufe aufgerufen
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Produkt-Namen-Mapping
const PRODUKT_NAMEN: Record<string, string> = {
  'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte': 'Der Tag, an dem der Schmetterling erwachte (Teil 1)',
  'wo_die_seele_den_wind_beruehrt': 'Wo die Seele den Wind berührt (Teil 2)',
  'mensch_sein': 'Mut zum Echtsein (Hörbuch)',
  'morgendliche_selbsthypnose': 'Morgendliche Selbsthypnose',
  'abendliche_selbsthypnose': 'Abendliche Selbsthypnose',
}

async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Telegram notification failed:', err);
    return false;
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Flow der Stille <kontakt@flow-der-stille.de>',
      to,
      subject,
      html,
    }),
  })
  return res.ok
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase Database Webhook sendet den neuen Datensatz als JSON
    const payload = await req.json()

    // Webhook-Payload: { type: 'INSERT', table: 'kaeufe', record: {...} }
    const record = payload.record ?? payload

    const {
      user_id,
      produkt_id,
      preis,
      waehrung = 'EUR',
      order_id,
      created_at,
    } = record

    const produktName = PRODUKT_NAMEN[produkt_id] ?? produkt_id
    const preisFormatiert = `${Number(preis).toFixed(2).replace('.', ',')} ${waehrung === 'EUR' ? '€' : waehrung}`
    const datum = new Date(created_at ?? Date.now()).toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    // Käufer-E-Mail aus Supabase Auth laden
    let kaeuferEmail = 'Unbekannt (Gast/Magic Link)'
    if (user_id && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY)
      const { data: userData } = await supabase.auth.admin.getUserById(user_id)
      if (userData?.user?.email) {
        kaeuferEmail = userData.user.email
      }
    }

    // ── 0. Telegram Push-Nachricht an dich ──────────────────────────────────
    await sendTelegram(`
💰 <b>Neuer Kauf bei Flow der Stille!</b>

🎧 <b>Produkt:</b> ${produktName}
💶 <b>Betrag:</b> ${preisFormatiert}
👤 <b>Käufer:</b> ${kaeuferEmail}
📋 <b>Bestell-ID:</b> <code>${order_id ?? '—'}</code>
🕒 <b>Zeitpunkt:</b> ${datum}
    `.trim())

    // ── 1. E-Mail-Benachrichtigung an dich ───────────────────────────────────
    await sendEmail(
      'info@flow-der-stille.de',
      `🎉 Neuer Kauf: ${produktName} (${preisFormatiert})`,
      `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f7f4;">
          <h2 style="color: #2d4a3e; margin-bottom: 8px;">🎉 Neuer Kauf eingegangen!</h2>
          <p style="color: #555; margin-bottom: 24px;">Ein neuer Kauf wurde über den Ruhe-Shop verbucht.</p>
          
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <tr style="background: #2d4a3e; color: white;">
              <td style="padding: 12px 16px; font-weight: bold;">Produkt</td>
              <td style="padding: 12px 16px;">${produktName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #555; border-bottom: 1px solid #eee;">Preis</td>
              <td style="padding: 12px 16px; font-weight: bold; color: #2d4a3e;">${preisFormatiert}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #555; border-bottom: 1px solid #eee;">Käufer E-Mail</td>
              <td style="padding: 12px 16px;">${kaeuferEmail}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #555; border-bottom: 1px solid #eee;">Order ID</td>
              <td style="padding: 12px 16px; font-size: 12px; color: #888;">${order_id ?? '—'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #555;">Datum & Uhrzeit</td>
              <td style="padding: 12px 16px;">${datum}</td>
            </tr>
          </table>
          
          <p style="margin-top: 24px; font-size: 12px; color: #aaa;">
            Diese Nachricht wurde automatisch von Flow der Stille generiert.<br>
            <a href="https://supabase.com/dashboard/project/fsfoxgezrcqkjhfyqcwa/editor" style="color: #2d4a3e;">→ Supabase Dashboard öffnen</a>
          </p>
        </div>
      `
    )

    // ── 2. Bestätigung an den Käufer (nur wenn E-Mail bekannt) ───────────────
    if (kaeuferEmail !== 'Unbekannt (Gast/Magic Link)') {
      await sendEmail(
        kaeuferEmail,
        `Dein Kauf bei Flow der Stille – ${produktName}`,
        `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f7f4;">
            <h2 style="color: #2d4a3e;">Vielen Dank für deinen Kauf! 🌿</h2>
            <p style="color: #555;">Du hast erfolgreich freigeschaltet:</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <p style="font-size: 18px; font-weight: bold; color: #2d4a3e; margin: 0 0 8px 0;">${produktName}</p>
              <p style="color: #888; margin: 0;">Einmalig ${preisFormatiert} · Kein Abo</p>
            </div>
            
            <p style="color: #555;">Du kannst deine Inhalte jetzt direkt im Web-Player oder in der Android-App streamen.</p>
            
            <a href="https://flow-der-stille.de/dashboard" 
               style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2d4a3e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              → Zur Mediathek
            </a>
            
            <p style="margin-top: 24px; font-size: 12px; color: #aaa;">
              Herzliche Grüße · Dein Team von Flow der Stille<br>
              <a href="https://flow-der-stille.de" style="color: #2d4a3e;">flow-der-stille.de</a>
            </p>
          </div>
        `
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('notify-new-purchase error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
