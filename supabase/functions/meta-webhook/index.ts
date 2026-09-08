// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const META_VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN');
const META_PAGE_ACCESS_TOKEN = Deno.env.get('META_PAGE_ACCESS_TOKEN');
const GRAPH_API_VERSION = 'v21.0';

// Ziel-Link für die Registrierung
const REGISTER_URL = Deno.env.get('REGISTER_URL') || 'https://flow-der-stille.de/register';

// Standard-Nachrichtentexte
const DEFAULT_COMMENT_REPLY = 
  "Wundervoll, dass du dir diesen Moment nimmst! 🌿 Ich habe dir soeben eine Direktnachricht mit deinem persönlichen Ruhebereich geschickt. Schau gleich mal in dein Postfach! ✨";

const DEFAULT_DM_TEXT = 
  `Hallo! 🧘‍♂️\n\nSchön, dass du den Impuls für mehr innere Ruhe setzt.\n\nHier ist dein persönlicher Zugang zu deinem Raum der Stille:\n\n👉 ${REGISTER_URL}\n\nErstelle dir in wenigen Augenblicken deinen kostenlosen Account und entdecke geführte Meditationen, Atemübungen und deinen täglichen Ruhebegleiter.\n\nWir freuen uns auf dich!\nHerzliche Grüße\nDein Flow der Stille Team 🌿`;

/**
 * Sendet eine öffentliche Antwort direkt unter den Kommentar
 */
async function replyToInstagramComment(commentId: string, accessToken: string, message: string) {
  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${commentId}/replies`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`[Meta Webhook] Fehler bei Kommentar-Antwort (${commentId}):`, data);
      return false;
    }
    console.log(`[Meta Webhook] Kommentar-Antwort erfolgreich gesendet (${commentId}):`, data);
    return true;
  } catch (err: any) {
    console.error(`[Meta Webhook] Ausnahme bei Kommentar-Antwort (${commentId}):`, err.message);
    return false;
  }
}

/**
 * Sendet eine private Direktnachricht (DM) an den Verfasser des Kommentars
 */
async function sendInstagramDM(commentId: string, recipientId: string | null, accessToken: string, text: string) {
  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`;

    // 1. Primär: Meta Instagram Private Reply via comment_id (offizieller Weg für Kommentar-Antworten)
    let bodyPayload: any = {
      recipient: { comment_id: commentId },
      message: { text }
    };

    let res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    let data = await res.json();

    // 2. Fallback: Falls comment_id abgelehnt wird und recipientId vorhanden ist
    if (!res.ok && recipientId) {
      console.warn(`[Meta Webhook] comment_id Reply fehlgeschlagen, versuche recipient.id (${recipientId}):`, data);
      bodyPayload = {
        recipient: { id: recipientId },
        message: { text }
      };

      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      data = await res.json();
    }

    if (!res.ok) {
      console.error(`[Meta Webhook] Fehler beim Senden der DM:`, data);
      return false;
    }

    console.log(`[Meta Webhook] Instagram DM erfolgreich gesendet:`, data);
    return true;
  } catch (err: any) {
    console.error(`[Meta Webhook] Ausnahme beim Senden der Instagram DM:`, err.message);
    return false;
  }
}

serve(async (req) => {
  const url = new URL(req.url);

  // =========================================================================
  // 1. GET Request: Meta Webhook Verifizierung (Handshake)
  // =========================================================================
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log(`[Meta Webhook] GET Handshake erhalten (mode: ${mode})`);

    if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
      console.log('[Meta Webhook] Handshake erfolgreich verifiziert.');
      return new Response(challenge || '', { status: 200 });
    }

    console.warn('[Meta Webhook] Handshake fehlgeschlagen: Ungültiger Token.');
    return new Response('Forbidden', { status: 403 });
  }

  // =========================================================================
  // 2. POST Request: Eingehende Events (z. B. Kommentare)
  // =========================================================================
  if (req.method === 'POST') {
    if (!META_PAGE_ACCESS_TOKEN) {
      console.error('[Meta Webhook] META_PAGE_ACCESS_TOKEN fehlt in den Supabase Secrets!');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: Token missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const payload = await req.json();
      console.log('[Meta Webhook] POST Event empfangen:', JSON.stringify(payload));

      // Prüfung auf Instagram-Event
      if (payload.object === 'instagram') {
        const entries = payload.entry || [];

        for (const entry of entries) {
          const pageOrAccountId = entry.id;
          const changes = entry.changes || [];

          for (const change of changes) {
            // Reagiere auf das Feld 'comments'
            if (change.field === 'comments') {
              const value = change.value || {};
              const commentId = value.id;
              const text = (value.text || '').trim();
              const fromUser = value.from || {};
              const fromUserId = fromUser.id;

              // Vermeide Endlosschleife: Nicht auf eigene Kommentare antworten
              if (fromUserId && fromUserId === pageOrAccountId) {
                console.log(`[Meta Webhook] Eigener Kommentar (${commentId}) ignoriert.`);
                continue;
              }

              // Keyword-Filter: "ruhe" (case-insensitive als eigenständiges Wort oder Teil)
              const hasKeyword = /ruhe/i.test(text);

              if (hasKeyword && commentId) {
                console.log(`[Meta Webhook] Keyword 'ruhe' erkannt in Kommentar ${commentId}: "${text}" von @${fromUser.username || fromUserId}`);

                // Parallel oder sequenziell: DM senden & Kommentar beantworten
                await Promise.allSettled([
                  // 1. Öffentliche Bestätigung unter dem Kommentar
                  replyToInstagramComment(commentId, META_PAGE_ACCESS_TOKEN, DEFAULT_COMMENT_REPLY),

                  // 2. Private Direktnachricht mit Registrierungslink
                  sendInstagramDM(commentId, fromUserId, META_PAGE_ACCESS_TOKEN, DEFAULT_DM_TEXT)
                ]);
              } else {
                console.log(`[Meta Webhook] Kommentar ${commentId} enthält nicht das Keyword 'ruhe'. Ignoriert.`);
              }
            }
          }
        }
      }

      // Meta erwartet zwingend einen 200 OK Response, damit der Webhook nicht deaktiviert wird
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err: any) {
      console.error('[Meta Webhook] Fehler bei der Event-Verarbeitung:', err.message);
      // Dennoch 200 zurückgeben, um Retries von ungültigen Payloads zu verhindern
      return new Response(JSON.stringify({ error: err.message }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});
