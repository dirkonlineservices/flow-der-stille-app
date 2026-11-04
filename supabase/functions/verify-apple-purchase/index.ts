// Version: 1.0.0 - Prüft App-Store-Käufe über die App Store Server API und speichert sie in kaeufe
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// 🔑 In-App-Purchase-Schlüssel aus App Store Connect (Benutzer und Zugriff → Integrationen → In-App-Kauf)
const APPLE_KEY_ID = Deno.env.get('APPLE_IAP_KEY_ID') ?? ''
const APPLE_ISSUER_ID = Deno.env.get('APPLE_IAP_ISSUER_ID') ?? ''
const APPLE_PRIVATE_KEY = Deno.env.get('APPLE_IAP_PRIVATE_KEY') ?? ''
const BUNDLE_ID = 'app.flowderstille.de'

const APPLE_API_PRODUCTION = 'https://api.storekit.itunes.apple.com'
const APPLE_API_SANDBOX = 'https://api.storekit-sandbox.itunes.apple.com'

// 🗺️ App Store Produkt-ID -> Supabase DB ID (identisch zu Google Play)
const STORE_TO_DB_MAP: Record<string, string> = {
  // Hörbücher
  'fds_mensch_sein': 'mensch_sein',
  'fds_schmetterling': 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte',
  'fds_seele_wind': 'wo_die_seele_den_wind_beruehrt',

  // Selbsthypnosen & Meditationen
  'fds_selbsthypnose_selbstbewusstsein': 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen',
  'fds_herzoeffnung_meditation': 'meditation_zur_herzoeffnung',
  'fds_meditation_loslassen': 'meditation_loslassen',
  'fds_selbsthypnose_gesunde_ernaehrung': 'selbsthypnose_ernaehrung',
  'fds_selbsthypnose_fokus_absolute_konzentration': 'selbsthypnose_fokus&konzentration',
  'fds_herzkompass_meditation': 'meditation_herzkompass',
  'fds_meditation_inneres_kind': 'meditation_inneres_kind',
  'fds_meditation_innere_ruhe': 'meditation_innere_ruhe',
  'fds_pmr_basis': 'pmr_basis',
  'fds_gefuehrte_atemuebung': 'gefuehrte_atemuebung'
};

const base64url = (bytes: Uint8Array | string): string => {
  const bin = typeof bytes === 'string' ? bytes : String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const decodeJwsPayload = (jws: string): any => {
  const part = jws.split('.')[1] || '';
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))));
};

// Signiertes Token (ES256) für die App Store Server API, gültig 20 Minuten
const createAppleApiToken = async (): Promise<string> => {
  const pem = APPLE_PRIVATE_KEY
    .replace(/\\n/g, '\n')
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const keyData = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8', keyData, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: APPLE_KEY_ID, typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: APPLE_ISSUER_ID,
    iat: now,
    exp: now + 20 * 60,
    aud: 'appstoreconnect-v1',
    bid: BUNDLE_ID
  }));
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${header}.${payload}`)
  );
  return `${header}.${payload}.${base64url(new Uint8Array(signature))}`;
};

// Transaktion direkt bei Apple abfragen: erst Produktion, bei 404 Sandbox (TestFlight)
const fetchAppleTransaction = async (transactionId: string): Promise<any> => {
  const token = await createAppleApiToken();
  for (const baseUrl of [APPLE_API_PRODUCTION, APPLE_API_SANDBOX]) {
    const res = await fetch(`${baseUrl}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 404) continue;
    if (!res.ok) {
      throw new Error(`App Store Server API antwortet mit ${res.status}: ${await res.text()}`);
    }
    const { signedTransactionInfo } = await res.json();
    // Die Antwort kommt authentifiziert per TLS direkt von Apple, daher genügt das Auslesen der Nutzdaten.
    return decodeJwsPayload(signedTransactionInfo);
  }
  throw new Error('Transaktion bei Apple nicht gefunden.');
};

const jsonResponse = (body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transactionId, productId } = await req.json()

    if (!transactionId || !productId) {
      throw new Error('Fehlende Parameter: transactionId oder productId erforderlich.');
    }
    if (!APPLE_KEY_ID || !APPLE_ISSUER_ID || !APPLE_PRIVATE_KEY) {
      throw new Error('Apple-Schlüssel fehlen (APPLE_IAP_KEY_ID, APPLE_IAP_ISSUER_ID, APPLE_IAP_PRIVATE_KEY).');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Kauf bei Apple prüfen
    const tx = await fetchAppleTransaction(String(transactionId));

    if (tx.bundleId !== BUNDLE_ID) {
      throw new Error(`Falsche App (${tx.bundleId}).`);
    }
    if (tx.productId !== productId) {
      throw new Error(`Produkt passt nicht zur Transaktion (${tx.productId} statt ${productId}).`);
    }

    const storeProductId: string = tx.productId;
    const dbProductId = STORE_TO_DB_MAP[storeProductId] || storeProductId;
    const isSandbox = tx.environment === 'Sandbox';
    const orderId = `${isSandbox ? 'APPLE.SANDBOX' : 'APPLE'}.${tx.originalTransactionId || tx.transactionId}`;
    const price = typeof tx.price === 'number' ? tx.price / 1000 : 1.99;
    const currency = tx.currency || 'EUR';

    // 2. Käufer ermitteln: nur aus dem Login-Token, nie aus dem Request-Body
    let userId: string | null = null;
    let userEmail: string | null = null;
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    if (jwt) {
      const { data: authData } = await supabase.auth.getUser(jwt);
      if (authData?.user) {
        userId = authData.user.id;
        userEmail = authData.user.email ?? null;
      }
    }

    // Erstattet/widerrufen: Freischaltung entfernen
    if (tx.revocationDate) {
      if (userId) {
        await supabase.from('kaeufe').delete().eq('user_id', userId).eq('produkt_id', dbProductId);
      }
      return jsonResponse({ success: false, refunded: true, error: 'Dieser Kauf wurde von Apple erstattet.' });
    }

    if (!userId) {
      // Automatischer Gast-Account je Apple-Kauf (wie bei Google Play)
      const gastEmail = `apple-gast-${String(tx.originalTransactionId || tx.transactionId).toLowerCase()}@flow-der-stille.de`;
      const { data: existingProfile } = await supabase
        .from('profiles').select('id').eq('email', gastEmail).maybeSingle();

      if (existingProfile?.id) {
        userId = existingProfile.id;
      } else {
        const { data: newU, error: crErr } = await supabase.auth.admin.createUser({
          email: gastEmail,
          email_confirm: true,
          user_metadata: { is_guest: true, source: 'apple_inapp', order_id: orderId }
        });
        if (crErr || !newU?.user) throw new Error(`Gast-Account konnte nicht angelegt werden: ${crErr?.message}`);
        userId = newU.user.id;
        await supabase.from('profiles').upsert({ id: userId, email: gastEmail, is_premium: true });
      }
      userEmail = `App Store Gast (${orderId})`;
    }

    // 3. In public.kaeufe speichern (gleiches Schema wie Google Play)
    const { error: dbError } = await supabase
      .from('kaeufe')
      .upsert({
        user_id: userId,
        produkt_id: dbProductId,
        preis: price,
        waehrung: currency,
        order_id: `${orderId}_${dbProductId}`,
        email: userEmail,
        created_at: new Date().toISOString(),
        widerruf_verzicht_akzeptiert: true
      }, { onConflict: 'user_id,produkt_id' });

    if (dbError) {
      throw new Error(`Kauf konnte nicht gespeichert werden: ${dbError.message}`);
    }

    await supabase
      .from('profiles')
      .update({ is_premium: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return jsonResponse({
      success: true,
      orderId,
      productId: storeProductId,
      dbProductId,
      price,
      environment: tx.environment
    });

  } catch (error: any) {
    console.error('verify-apple-purchase:', error);
    return jsonResponse({ success: false, error: error.message || 'Verifizierungsfehler' });
  }
})
