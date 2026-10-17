import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    // Webhook-Daten von Supabase empfangen
    const payload = await req.json()
    const newUser = payload.record

    // Secrets aus den Supabase-Umgebungsvariablen laden
    // Eigener Kanal „Notifier für neue User“ (TELEGRAM_USER_*); Fallback: allgemeiner Kanal (Umsatzalert)
    const botToken = Deno.env.get('TELEGRAM_USER_BOT_TOKEN') || Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_USER_CHAT_ID') || Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      return new Response("Missing Telegram Secrets", { status: 500 })
    }

    // Formatierte Nachricht für Telegram
    const createdAt = newUser.created_at 
      ? new Date(newUser.created_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })
      : 'Gerade eben'

    const message = `🎉 *Neuer App-User bei Flow der Stille!*\n\n` +
                    `📧 *E-Mail:* \`${newUser.email || 'Keine Angabe'}\`\n` +
                    `📅 *Datum:* ${createdAt}\n` +
                    `🆔 *ID:* \`${newUser.id}\``

    // Nachricht an Telegram API senden
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    const resData = await response.json()

    return new Response(JSON.stringify({ success: true, telegram: resData }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})