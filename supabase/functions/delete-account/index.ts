// @ts-nocheck
// =============================================================================
// FLOW DER STILLE – Konto löschen (DSGVO Art. 17 & Apple App Store 5.1.1(v))
// -----------------------------------------------------------------------------
// Löscht das Konto des eingeloggten Nutzers vollständig:
//   1. Käufe (kaeufe)            → bleiben als Beleg erhalten (steuerliche Aufbewahrungspflicht);
//                                   ihre user_id verweist danach auf kein Konto mehr.
//   2. Einwilligungen            → anonymisiert (Nachweis der Einwilligung bleibt).
//   3. Bewertungen, eigene Empfehlungen, VIP-Zugang → gelöscht.
//   4. Profil (profiles)         → gelöscht.
//   5. Supabase-Auth-Konto       → gelöscht (Service-Role).
// Newsletter-Anmeldungen bleiben bestehen (eigene Einwilligung, Abmeldung per Link).
// Autoren von Blogbeiträgen (blog_posts.author_id) können bewusst NICHT gelöscht werden.
// =============================================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Nicht angemeldet.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Nur der eingeloggte Nutzer selbst darf sein Konto löschen
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return json({ error: 'Sitzung ungültig. Bitte erneut anmelden.' }, 401)
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey)
    const warnings: string[] = []
    const step = async (label: string, run: () => Promise<{ error: any }>) => {
      const { error } = await run()
      if (error) {
        console.warn(`[delete-account] ${label}:`, error.message)
        warnings.push(`${label}: ${error.message}`)
      }
    }

    // kaeufe bleiben unverändert: user_id ist Pflichtfeld ohne Fremdschlüssel. Nach dem Löschen des
    // Kontos zeigt sie auf keine Person mehr (pseudonymisiert), der Beleg bleibt für die Aufbewahrung erhalten.
    await step('user_consents anonymisieren', () =>
      admin.from('user_consents').update({ user_id: null }).eq('user_id', user.id))
    // newsletter_leads hängt per ON DELETE CASCADE am Konto → vorher lösen, damit die Anmeldung bestehen bleibt
    await step('newsletter_leads lösen', () =>
      admin.from('newsletter_leads').update({ user_id: null }).eq('user_id', user.id))
    await step('produkt_bewertungen löschen', () =>
      admin.from('produkt_bewertungen').delete().eq('user_id', user.id))
    // referrals & vip_zugang verweisen ohne CASCADE auf Profil/Konto und würden das Löschen sonst blockieren
    await step('referrals (eingeladen) lösen', () =>
      admin.from('referrals').update({ referred_id: null }).eq('referred_id', user.id))
    await step('referrals (eigene) löschen', () =>
      admin.from('referrals').delete().eq('referrer_id', user.id))
    await step('vip_zugang löschen', () =>
      admin.from('vip_zugang').delete().eq('user_id', user.id))
    await step('profiles löschen', () =>
      admin.from('profiles').delete().eq('id', user.id))

    // Entscheidender Schritt: ohne gelöschtes Auth-Konto gilt die Löschung als fehlgeschlagen
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('[delete-account] auth.admin.deleteUser:', deleteError.message, warnings)
      return json({ error: 'Konto konnte nicht gelöscht werden. Bitte kontaktiere uns.', details: deleteError.message }, 500)
    }

    console.log(`[delete-account] Konto ${user.id} gelöscht`, warnings.length ? warnings : '')
    return json({ success: true, warnings })
  } catch (err) {
    console.error('[delete-account] Unerwarteter Fehler:', err)
    return json({ error: 'Unerwarteter Fehler beim Löschen.' }, 500)
  }
})
