// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Verify user from token
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Unauthorized user')
    }

    const { transaction_id, product_id, product_name, price } = await req.json()

    if (!transaction_id || !product_id) {
      throw new Error('Missing required fields: transaction_id or product_id')
    }

    // Insert purchase record into kaeufe table using service role
    const { error: dbError } = await supabaseClient.from('kaeufe').insert([
      {
        user_id: user.id,
        produkt_id: product_id,
        paypal_order_id: transaction_id,
        preis: price || 0.00,
        waehrung: 'EUR',
        widerruf_verzicht_akzeptiert: true,
      }
    ])

    if (dbError) {
      console.error('Database insert error:', dbError)
      throw dbError
    }

    // Send purchase confirmation email via Resend if RESEND_API_KEY is available and user has email
    if (RESEND_API_KEY && user.email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Flow der Stille <kontakt@flow-der-stille.de>',
            to: user.email,
            subject: `Deine Kaufbestätigung: ${product_name || 'Flow der Stille Premium'}`,
            text: `Hallo,\n\nvielen Dank für deinen Kauf von "${product_name || 'Flow der Stille Premium'}"!\n\nDeine Transaktions-ID lautet: ${transaction_id}\nBetrag: ${price || '0.00'} EUR\n\nAlle Inhalte sind ab sofort in deinem Account freigeschaltet.\n\nHerzliche Grüße\nDas Team von Flow der Stille\nhttps://flow-der-stille.de`
          })
        })
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr)
      }
    }

    return new Response(JSON.stringify({ success: true, transaction_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Process purchase error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
