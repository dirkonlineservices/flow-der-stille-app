// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, message, honeypot } = await req.json()

    // Bot-Schutz: Wenn das Honeypot-Feld gefüllt ist, stillschweigend abbrechen
    if (honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 1. Autoresponder an den Nutzer
    const userRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Flow der Stille <kontakt@flow-der-stille.de>',
        to: email,
        subject: 'Deine Nachricht ist angekommen – Flow der Stille',
        text: `Hallo ${name},\n\nvielen Dank für deine Nachricht und dein Vertrauen.\n\nWir haben dein Anliegen erhalten. Wir schauen uns deine Rückmeldung in Ruhe an und melden uns so schnell wie möglich bei dir zurück.\n\nBis dahin wünschen wir dir einen entspannten Tag.\n\nHerzliche Grüße\nDas Team von Flow der Stille\n\n---\nFlow der Stille\nhttps://flow-der-stille.de`
      })
    })

    // 2. Notification an DICH (optional, aber empfohlen)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Flow der Stille System <kontakt@flow-der-stille.de>',
        to: 'info@flow-der-stille.de',
        subject: `Neue Kontaktanfrage von ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nNachricht:\n${message}`
      })
    })

    const data = await userRes.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
