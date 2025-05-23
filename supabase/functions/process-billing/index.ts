import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get all active subscriptions due for billing
    const { data: subscriptions, error: fetchError } = await supabaseClient
      .from("user_subscriptions")
      .select(`
        *,
        tier:subscription_tiers(*),
        payment_method:payment_methods(*),
        user:users(*)
      `)
      .eq("status", "active")
      .lte("next_billing_date", new Date().toISOString());

    if (fetchError) throw fetchError;

    for (const subscription of subscriptions) {
      try {
        // Initialize payment with Paystack
        const amount = subscription.billing_cycle === "monthly" 
          ? subscription.tier.monthly_price 
          : subscription.tier.annual_price;

        const paymentResponse = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: subscription.user.email,
            amount: Math.round(amount * 100),
            authorization_code: subscription.payment_method.paystack_authorization_code,
          }),
        });

        const paymentData = await paymentResponse.json();

        if (!paymentData.status) {
          throw new Error("Payment failed");
        }

        // Calculate next billing date
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(
          nextBillingDate.getMonth() + (subscription.billing_cycle === "monthly" ? 1 : 12)
        );

        // Update subscription
        await supabaseClient
          .from("user_subscriptions")
          .update({
            next_billing_date: nextBillingDate.toISOString(),
          })
          .eq("id", subscription.id);

      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        
        // Update subscription status if payment fails
        await supabaseClient
          .from("user_subscriptions")
          .update({
            status: "payment_failed",
          })
          .eq("id", subscription.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: subscriptions.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});