// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const META_VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN');
const RAW_META_PAGE_ACCESS_TOKEN = Deno.env.get('META_PAGE_ACCESS_TOKEN') || '';
// Whitespace and quotes trimming in case the secret was pasted with quotes/newlines
const META_PAGE_ACCESS_TOKEN = RAW_META_PAGE_ACCESS_TOKEN.trim().replace(/^["']|["']$/g, '').trim();
const GRAPH_API_VERSION = 'v21.0';

// Ziel-Link für die Registrierung
const REGISTER_URL = Deno.env.get('REGISTER_URL') || 'https://www.flow-der-stille.de/register';

// Standard-Nachrichtentexte
const DEFAULT_COMMENT_REPLY = 
  "Wundervoll, dass du dir diesen Moment nimmst! 🌿 Ich habe dir soeben eine Direktnachricht mit deinem persönlichen Ruhebereich geschickt. Schau gleich mal in dein Postfach (auch unter Anfragen)! ✨";

const DEFAULT_DM_TEXT = 
  `Hallo! 🧘‍♂️\n\nSchön, dass du den Impuls für mehr innere Ruhe setzt.\n\nHier ist dein persönlicher Zugang zu deinem Raum der Stille:\n\n👉 ${REGISTER_URL}\n\nErstelle dir in wenigen Augenblicken deinen kostenlosen Account und entdecke geführte Meditationen, Atemübungen und deinen täglichen Ruhebegleiter.\n\nWir freuen uns auf dich!\nHerzliche Grüße\nDein Flow der Stille Team 🌿`;

/**
 * Sendet eine öffentliche Antwort direkt unter den Kommentar
 */
async function replyToInstagramComment(commentId: string, accessToken: string, message: string) {
  const candidateUrls = [
    `https://graph.instagram.com/${GRAPH_API_VERSION}/${commentId}/replies`,
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${commentId}/replies`
  ];

  for (const baseUrl of candidateUrls) {
    try {
      const urlWithToken = `${baseUrl}?access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(urlWithToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[Meta Webhook] Kommentar-Antwort erfolgreich gesendet (${baseUrl}):`, data);
        return { success: true, data, endpoint: baseUrl };
      }
      console.warn(`[Meta Webhook] Kommentar-Antwort fehlgeschlagen (${baseUrl}):`, JSON.stringify(data));
    } catch (err: any) {
      console.error(`[Meta Webhook] Ausnahme bei Kommentar-Antwort (${baseUrl}):`, err.message);
    }
  }

  return { success: false, error: 'Alle Kommentar-Reply-Versuche fehlgeschlagen' };
}

/**
 * Sendet eine private Direktnachricht (DM) an den Verfasser des Kommentars
 */
async function sendInstagramDM(pageOrAccountId: string | null, commentId: string, recipientId: string | null, accessToken: string, text: string) {
  // Wir probieren Endpunkte für graph.instagram.com und graph.facebook.com:
  const candidateUrls: string[] = [
    `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`,
  ];
  if (pageOrAccountId) {
    candidateUrls.push(`https://graph.instagram.com/${GRAPH_API_VERSION}/${pageOrAccountId}/messages`);
    candidateUrls.push(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageOrAccountId}/messages`);
  }
  candidateUrls.push(`https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`);

  // 1. Versuch: Private Reply via comment_id (offizieller Weg für Instagram Kommentar-Automationen)
  for (const baseUrl of candidateUrls) {
    try {
      const urlWithToken = `${baseUrl}?access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(urlWithToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: { text }
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[Meta Webhook] Instagram DM erfolgreich gesendet via comment_id (${baseUrl}):`, data);
        return { success: true, data, endpoint: baseUrl };
      }
      console.warn(`[Meta Webhook] DM via comment_id fehlgeschlagen (${baseUrl}):`, JSON.stringify(data));
    } catch (err: any) {
      console.error(`[Meta Webhook] Ausnahme via comment_id (${baseUrl}):`, err.message);
    }
  }

  // 2. Versuch (Fallback): Falls recipientId vorhanden, via recipient.id (IGSID)
  if (recipientId) {
    for (const baseUrl of candidateUrls) {
      try {
        const urlWithToken = `${baseUrl}?access_token=${encodeURIComponent(accessToken)}`;
        const res = await fetch(urlWithToken, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text }
          }),
        });

        const data = await res.json();
        if (res.ok) {
          console.log(`[Meta Webhook] Instagram DM erfolgreich gesendet via recipient.id (${baseUrl}):`, data);
          return { success: true, data, endpoint: baseUrl };
        }
        console.warn(`[Meta Webhook] DM via recipient.id fehlgeschlagen (${baseUrl}):`, JSON.stringify(data));
      } catch (err: any) {
        console.error(`[Meta Webhook] Ausnahme via recipient.id (${baseUrl}):`, err.message);
      }
    }
  }

  return { success: false, error: 'Alle DM-Versuche fehlgeschlagen' };
}

serve(async (req) => {
  const url = new URL(req.url);

  // =========================================================================
  // 1. GET Request: Verifizierung (Handshake) ODER Token-Diagnose
  // =========================================================================
  if (req.method === 'GET') {
    // Diagnose-Modus: Prüfe Token-Gültigkeit und Berechtigungen
    if (url.searchParams.get('test_token') === '1') {
      if (!META_PAGE_ACCESS_TOKEN) {
        return new Response(JSON.stringify({ error: 'META_PAGE_ACCESS_TOKEN is not set in secrets' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const [meRes, permsRes, igDirectMeRes, igDirectPermsRes] = await Promise.all([
          fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/me?access_token=${META_PAGE_ACCESS_TOKEN}`),
          fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/me/permissions?access_token=${META_PAGE_ACCESS_TOKEN}`),
          fetch(`https://graph.instagram.com/me?fields=id,username,account_type&access_token=${META_PAGE_ACCESS_TOKEN}`),
          fetch(`https://graph.instagram.com/me/permissions?access_token=${META_PAGE_ACCESS_TOKEN}`)
        ]);

        const meData = await meRes.json();
        const permsData = await permsRes.json();
        const igDirectMeData = await igDirectMeRes.json();
        const igDirectPermsData = await igDirectPermsRes.json();

        // Prüfe auch verknüpften Instagram Account
        let igAccountData = null;
        try {
          const igRes = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/me?fields=instagram_business_account{id,username}&access_token=${META_PAGE_ACCESS_TOKEN}`);
          igAccountData = await igRes.json();
        } catch (e) {}

        // Teste messages endpoint auf graph.instagram.com mit comment_id vs id
        let igDirectMessagesTest = null;
        let igDirectCommentReplyDMTest = null;
        try {
          const [idRes, commentRes] = await Promise.all([
            fetch(`https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages?access_token=${encodeURIComponent(META_PAGE_ACCESS_TOKEN)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipient: { id: "123456789" }, message: { text: "test" } })
            }),
            fetch(`https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages?access_token=${encodeURIComponent(META_PAGE_ACCESS_TOKEN)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipient: { comment_id: "123456789" }, message: { text: "test" } })
            })
          ]);
          igDirectMessagesTest = await idRes.json();
          igDirectCommentReplyDMTest = await commentRes.json();
        } catch (e: any) {
          igDirectMessagesTest = { error: e.message };
        }

        // Teste debug_token
        let debugTokenTest = null;
        try {
          const dtRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(META_PAGE_ACCESS_TOKEN)}&access_token=${encodeURIComponent(META_PAGE_ACCESS_TOKEN)}`);
          debugTokenTest = await dtRes.json();
        } catch (e: any) {
          debugTokenTest = { error: e.message };
        }

        return new Response(JSON.stringify({
          status: 'ok',
          token_info: {
            length: (META_PAGE_ACCESS_TOKEN || '').length,
            prefix: (META_PAGE_ACCESS_TOKEN || '').substring(0, 7),
            suffix: (META_PAGE_ACCESS_TOKEN || '').slice(-4),
            has_whitespace: /\s/.test(META_PAGE_ACCESS_TOKEN || ''),
            starts_with_quote: (META_PAGE_ACCESS_TOKEN || '').startsWith('"') || (META_PAGE_ACCESS_TOKEN || '').startsWith("'"),
          },
          facebook_graph_me: meData,
          facebook_graph_permissions: permsData,
          facebook_graph_ig_account: igAccountData,
          instagram_graph_me: igDirectMeData,
          instagram_messages_via_id: igDirectMessagesTest,
          instagram_messages_via_comment_id: igDirectCommentReplyDMTest,
          debug_token_test: debugTokenTest
        }, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (diagErr: any) {
        return new Response(JSON.stringify({ error: diagErr.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Meta Webhook Verifizierungs-Handshake
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
            if (change.field === 'comments') {
              const value = change.value || {};
              const commentId = value.id;
              const text = (value.text || '').trim();
              const fromUser = value.from || {};
              const fromUserId = fromUser.id;

              console.log(`[Meta Webhook] Eingehender Kommentar ${commentId}: "${text}" von ID: ${fromUserId} (@${fromUser.username || 'unbekannt'})`);

              // Keyword-Filter: "ruhe" (case-insensitive)
              const hasKeyword = /ruhe/i.test(text);

              if (hasKeyword && commentId) {
                console.log(`[Meta Webhook] Keyword 'ruhe' erkannt! Starte Aktionen...`);

                const [commentResult, dmResult] = await Promise.all([
                  replyToInstagramComment(commentId, META_PAGE_ACCESS_TOKEN, DEFAULT_COMMENT_REPLY),
                  sendInstagramDM(pageOrAccountId, commentId, fromUserId, META_PAGE_ACCESS_TOKEN, DEFAULT_DM_TEXT)
                ]);

                console.log(`[Meta Webhook] Ergebnis: Kommentar-Reply=${commentResult.success}, DM=${dmResult.success}`);
              } else {
                console.log(`[Meta Webhook] Kommentar enthält nicht 'ruhe'. Ignoriert.`);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err: any) {
      console.error('[Meta Webhook] Fehler bei der Event-Verarbeitung:', err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});
