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

    const { reference, amount, giftItemId, userId } = await req.json();

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    // Calculate fee based on user's subscription tier
    const { data: userData } = await supabaseClient
      .from("users")
      .select("subscription_tier_id")
      .eq("id", userId)
      .single();

    const { data: tierData } = await supabaseClient
      .from("subscription_tiers")
      .select("transaction_fee_percentage")
      .eq("id", userData?.subscription_tier_id)
      .single();

    const feePercentage = tierData?.transaction_fee_percentage || 5;
    const feeAmount = (amount * feePercentage) / 100;

    // Update transaction record
    const { error: transactionError } = await supabaseClient
      .from("transactions")
      .update({
        status: "completed",
        fee_amount: feeAmount,
      })
      .eq("paystack_reference", reference);

    if (transactionError) throw transactionError;

    // Update gift item purchased quantity
    const { error: giftError } = await supabaseClient.rpc(
      "increment_gift_purchased_quantity",
      { gift_item_id: giftItemId }
    );

    if (giftError) throw giftError;

    return new Response(
      JSON.stringify({ success: true }),
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