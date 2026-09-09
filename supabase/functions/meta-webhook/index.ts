// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const META_VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN');

// Instagram Access Token (beginnt oft mit IGAAPIb...)
const RAW_META_PAGE_ACCESS_TOKEN = Deno.env.get('META_PAGE_ACCESS_TOKEN') || '';
const META_PAGE_ACCESS_TOKEN = RAW_META_PAGE_ACCESS_TOKEN.trim().replace(/^["']|["']$/g, '').trim();

// Facebook Page Access Token (beginnt oft mit EAAB...)
const RAW_FB_PAGE_ACCESS_TOKEN = Deno.env.get('FB_PAGE_ACCESS_TOKEN') || Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN') || '';
const FB_PAGE_ACCESS_TOKEN = RAW_FB_PAGE_ACCESS_TOKEN.trim().replace(/^["']|["']$/g, '').trim() || 
  (META_PAGE_ACCESS_TOKEN.startsWith('EAA') ? META_PAGE_ACCESS_TOKEN : '');

const GRAPH_API_VERSION = 'v21.0';

// Ziel-Link für die Registrierung
const REGISTER_URL = Deno.env.get('REGISTER_URL') || 'https://www.flow-der-stille.de/register';

// Keyword-Filter (Standard: "ruhe"). Bei "*" oder "all" wird auf JEDEN Kommentar geantwortet.
const TRIGGER_KEYWORD = Deno.env.get('TRIGGER_KEYWORD') || 'ruhe';

function matchesKeyword(text: string): boolean {
  if (!text) return false;
  const trimmedTrigger = TRIGGER_KEYWORD.trim().toLowerCase();
  if (trimmedTrigger === '*' || trimmedTrigger === 'all') return true;
  
  const keywords = TRIGGER_KEYWORD.split(',').map(k => k.trim()).filter(Boolean);
  return keywords.some(k => new RegExp(`(^|\\s|\\W)${k}(\\W|\\s|$)`, 'i').test(text) || new RegExp(k, 'i').test(text));
}

// Standard-Nachrichtentexte
const DEFAULT_COMMENT_REPLY = 
  "Wundervoll, dass du dir diesen Moment nimmst! 🌿 Ich habe dir soeben eine Direktnachricht mit deinem persönlichen Ruhebereich geschickt. Schau gleich mal in dein Postfach (auch unter Anfragen)! ✨";

const DEFAULT_DM_TEXT = 
  `Hallo! 🧘‍♂️\n\nSchön, dass du den Impuls für mehr innere Ruhe setzt.\n\nHier ist dein persönlicher Zugang zu deinem Raum der Stille:\n\n👉 ${REGISTER_URL}\n\nErstelle dir in wenigen Augenblicken deinen kostenlosen Account und entdecke geführte Meditationen, Atemübungen und deinen täglichen Ruhebegleiter.\n\nWir freuen uns auf dich!\nHerzliche Grüße\nDein Flow der Stille Team 🌿`;

// =========================================================================
// 1. INSTAGRAM FUNKTIONEN
// =========================================================================

/**
 * Sendet eine öffentliche Antwort unter einen Instagram-Kommentar
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
        console.log(`[Meta Webhook] Instagram Kommentar-Antwort erfolgreich (${baseUrl}):`, data);
        return { success: true, data, endpoint: baseUrl };
      }
      console.warn(`[Meta Webhook] Instagram Kommentar-Antwort fehlgeschlagen (${baseUrl}):`, JSON.stringify(data));
    } catch (err: any) {
      console.error(`[Meta Webhook] Ausnahme bei Instagram Kommentar-Antwort (${baseUrl}):`, err.message);
    }
  }

  return { success: false, error: 'Alle Instagram Kommentar-Reply-Versuche fehlgeschlagen' };
}

/**
 * Sendet eine private Direktnachricht (DM) an den Verfasser eines Instagram-Kommentars
 */
async function sendInstagramDM(pageOrAccountId: string | null, commentId: string, recipientId: string | null, accessToken: string, text: string) {
  const candidateUrls: string[] = [
    `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`,
  ];
  if (pageOrAccountId) {
    candidateUrls.push(`https://graph.instagram.com/${GRAPH_API_VERSION}/${pageOrAccountId}/messages`);
    candidateUrls.push(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageOrAccountId}/messages`);
  }
  candidateUrls.push(`https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`);

  // 1. Versuch: Private Reply via comment_id
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
        console.log(`[Meta Webhook] Instagram DM via comment_id erfolgreich (${baseUrl}):`, data);
        return { success: true, data, endpoint: baseUrl };
      }
      console.warn(`[Meta Webhook] Instagram DM via comment_id fehlgeschlagen (${baseUrl}):`, JSON.stringify(data));
    } catch (err: any) {
      console.error(`[Meta Webhook] Ausnahme bei Instagram DM via comment_id (${baseUrl}):`, err.message);
    }
  }

  // 2. Versuch: via recipient.id (IGSID)
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
          console.log(`[Meta Webhook] Instagram DM via recipient.id erfolgreich (${baseUrl}):`, data);
          return { success: true, data, endpoint: baseUrl };
        }
        console.warn(`[Meta Webhook] Instagram DM via recipient.id fehlgeschlagen (${baseUrl}):`, JSON.stringify(data));
      } catch (err: any) {
        console.error(`[Meta Webhook] Ausnahme bei Instagram DM via recipient.id (${baseUrl}):`, err.message);
      }
    }
  }

  return { success: false, error: 'Alle Instagram DM-Versuche fehlgeschlagen' };
}

// =========================================================================
// 2. FACEBOOK FUNKTIONEN
// =========================================================================

/**
 * Sendet eine öffentliche Antwort unter einen Facebook-Kommentar
 */
async function replyToFacebookComment(commentId: string, accessToken: string, message: string) {
  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${commentId}/comments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[Meta Webhook] Facebook Kommentar-Antwort erfolgreich (${commentId}):`, data);
      return { success: true, data };
    }
    console.warn(`[Meta Webhook] Facebook Kommentar-Antwort fehlgeschlagen (${commentId}):`, JSON.stringify(data));
    return { success: false, data };
  } catch (err: any) {
    console.error(`[Meta Webhook] Ausnahme bei Facebook Kommentar-Antwort (${commentId}):`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sendet eine private Messenger-Nachricht an den Verfasser eines Facebook-Kommentars (Private Reply)
 */
async function sendFacebookDM(pageId: string | null, commentId: string, recipientId: string | null, accessToken: string, text: string) {
  const candidateUrls: string[] = [];
  if (pageId) {
    candidateUrls.push(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/messages`);
  }
  candidateUrls.push(`https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`);

  // 1. Versuch: Meta Private Reply via comment_id
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
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
        console.log(`[Meta Webhook] Facebook Messenger via comment_id erfolgreich (${url}):`, data);
        return { success: true, data, endpoint: url };
      }
      console.warn(`[Meta Webhook] Facebook Messenger via comment_id fehlgeschlagen (${url}):`, JSON.stringify(data));
    } catch (err: any) {
      console.error(`[Meta Webhook] Ausnahme bei Facebook Messenger via comment_id (${url}):`, err.message);
    }
  }

  // 2. Versuch: via recipient.id (PSID)
  if (recipientId) {
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
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
          console.log(`[Meta Webhook] Facebook Messenger via recipient.id erfolgreich (${url}):`, data);
          return { success: true, data, endpoint: url };
        }
        console.warn(`[Meta Webhook] Facebook Messenger via recipient.id fehlgeschlagen (${url}):`, JSON.stringify(data));
      } catch (err: any) {
        console.error(`[Meta Webhook] Ausnahme bei Facebook Messenger via recipient.id (${url}):`, err.message);
      }
    }
  }

  return { success: false, error: 'Alle Facebook Messenger-Versuche fehlgeschlagen' };
}

// =========================================================================
// 3. HTTP SERVER & ROUTING
// =========================================================================

serve(async (req) => {
  const url = new URL(req.url);

  // -------------------------------------------------------------------------
  // GET Request: Verifizierung (Handshake) ODER Token-Diagnose
  // -------------------------------------------------------------------------
  if (req.method === 'GET') {
    // Diagnose-Modus: Prüfe Token-Gültigkeit und Berechtigungen
    if (url.searchParams.get('test_token') === '1') {
      try {
        // 1. Instagram Token Check
        let igDirectMeData = null;
        if (META_PAGE_ACCESS_TOKEN) {
          try {
            const igRes = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type&access_token=${encodeURIComponent(META_PAGE_ACCESS_TOKEN)}`);
            igDirectMeData = await igRes.json();
          } catch (e: any) {
            igDirectMeData = { error: e.message };
          }
        }

        // 2. Facebook Token Check
        let fbMeData = null;
        if (FB_PAGE_ACCESS_TOKEN) {
          try {
            const fbRes = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/me?fields=id,name&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`);
            fbMeData = await fbRes.json();
          } catch (e: any) {
            fbMeData = { error: e.message };
          }
        }

        return new Response(JSON.stringify({
          status: 'ok',
          config: {
            trigger_keyword: TRIGGER_KEYWORD,
            register_url: REGISTER_URL,
            has_instagram_token: !!META_PAGE_ACCESS_TOKEN,
            has_facebook_token: !!FB_PAGE_ACCESS_TOKEN,
            has_verify_token: !!META_VERIFY_TOKEN,
          },
          instagram_token_info: {
            prefix: (META_PAGE_ACCESS_TOKEN || '').substring(0, 7),
            length: (META_PAGE_ACCESS_TOKEN || '').length,
            account: igDirectMeData
          },
          facebook_token_info: {
            prefix: (FB_PAGE_ACCESS_TOKEN || '').substring(0, 7),
            length: (FB_PAGE_ACCESS_TOKEN || '').length,
            account: fbMeData
          }
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

    // Meta Webhook Verifizierungs-Handshake (für Instagram und Facebook)
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

  // -------------------------------------------------------------------------
  // POST Request: Eingehende Events (Kommentare von Instagram oder Facebook)
  // -------------------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const payload = await req.json();
      console.log('[Meta Webhook] POST Event empfangen:', JSON.stringify(payload));

      const objectType = payload.object;

      // =====================================================================
      // FALL A: INSTAGRAM EVENT
      // =====================================================================
      if (objectType === 'instagram') {
        if (!META_PAGE_ACCESS_TOKEN) {
          console.error('[Meta Webhook] Kein Instagram Token (META_PAGE_ACCESS_TOKEN) konfiguriert!');
        } else {
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

                console.log(`[Meta Webhook] [Instagram] Kommentar ${commentId}: "${text}" von ID: ${fromUserId} (@${fromUser.username || 'unbekannt'})`);

                if (matchesKeyword(text) && commentId) {
                  console.log(`[Meta Webhook] [Instagram] Keyword-Treffer! Sende Reply & DM...`);
                  const [commentResult, dmResult] = await Promise.all([
                    replyToInstagramComment(commentId, META_PAGE_ACCESS_TOKEN, DEFAULT_COMMENT_REPLY),
                    sendInstagramDM(pageOrAccountId, commentId, fromUserId, META_PAGE_ACCESS_TOKEN, DEFAULT_DM_TEXT)
                  ]);
                  console.log(`[Meta Webhook] [Instagram] Ergebnis: Reply=${commentResult.success}, DM=${dmResult.success}`);
                } else {
                  console.log(`[Meta Webhook] [Instagram] Kommentar ignoriert (kein Keyword-Treffer).`);
                }
              }
            }
          }
        }
      }

      // =====================================================================
      // FALL B: FACEBOOK EVENT (Facebook-Seite)
      // =====================================================================
      else if (objectType === 'page') {
        const tokenToUse = FB_PAGE_ACCESS_TOKEN || META_PAGE_ACCESS_TOKEN;
        if (!tokenToUse) {
          console.error('[Meta Webhook] Kein Facebook Token (FB_PAGE_ACCESS_TOKEN) konfiguriert!');
        } else {
          const entries = payload.entry || [];
          for (const entry of entries) {
            const pageId = entry.id;
            const changes = entry.changes || [];

            for (const change of changes) {
              // Bei Facebook-Seiten ist das Feld 'feed'
              if (change.field === 'feed') {
                const value = change.value || {};
                const isComment = value.item === 'comment';
                const isAdd = !value.verb || value.verb === 'add';

                if (isComment && isAdd) {
                  const commentId = value.comment_id || value.id;
                  const text = (value.message || '').trim();
                  const senderId = value.sender_id || value.from?.id;
                  const senderName = value.sender_name || value.from?.name || 'unbekannt';

                  console.log(`[Meta Webhook] [Facebook] Kommentar ${commentId}: "${text}" von ID: ${senderId} (${senderName})`);

                  // Eigene Kommentare der Seite ignorieren, um Schleifen zu vermeiden
                  if (senderId && senderId === pageId) {
                    console.log(`[Meta Webhook] [Facebook] Eigener Seiten-Kommentar ignoriert.`);
                    continue;
                  }

                  if (matchesKeyword(text) && commentId) {
                    console.log(`[Meta Webhook] [Facebook] Keyword-Treffer! Sende Reply & Messenger DM...`);
                    const [commentResult, dmResult] = await Promise.all([
                      replyToFacebookComment(commentId, tokenToUse, DEFAULT_COMMENT_REPLY),
                      sendFacebookDM(pageId, commentId, senderId, tokenToUse, DEFAULT_DM_TEXT)
                    ]);
                    console.log(`[Meta Webhook] [Facebook] Ergebnis: Reply=${commentResult.success}, DM=${dmResult.success}`);
                  } else {
                    console.log(`[Meta Webhook] [Facebook] Kommentar ignoriert (kein Keyword-Treffer).`);
                  }
                }
              }
            }
          }
        }
      }

      // Meta erwartet immer einen 200 OK Response
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
