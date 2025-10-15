import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: cartItems, error: cartError } = await supabaseClient
      .from('cart_items')
      .select('quantity, products(price)')
      .eq('user_id', user.id)

    if (cartError) throw cartError

    if (!cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const totalAmount = cartItems.reduce((acc, item) => {
      // @ts-ignore
      return acc + item.products.price * item.quantity
    }, 0)

    // In a real application, you would integrate with a payment provider like Stripe here.
    // For example:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(totalAmount * 100), // amount in cents
    //   currency: 'usd',
    // });
    // const clientSecret = paymentIntent.client_secret;

    // For this example, we'll simulate a successful payment intent creation.
    const clientSecret = `pi_${Math.random().toString(36).substr(2, 16)}_secret_${Math.random().toString(36).substr(2, 16)}`

    return new Response(JSON.stringify({ client_secret: clientSecret, amount: totalAmount }), {
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