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
    const { transactionId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get transaction details
    const { data: transaction } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Initialize refund with Paystack
    const refundResponse = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: transaction.paystack_reference,
      }),
    });

    const refundData = await refundResponse.json();

    if (!refundData.status) {
      throw new Error("Refund initialization failed");
    }

    // Update transaction record
    const { error: updateError } = await supabaseClient
      .from("transactions")
      .update({
        status: "refunded",
        refund_reference: refundData.data.reference,
      })
      .eq("id", transactionId);

    if (updateError) throw updateError;

    // Update gift item purchased quantity
    const { error: giftError } = await supabaseClient
      .from("gift_items")
      .update({
        purchased_quantity: supabaseClient.sql`purchased_quantity - 1`,
      })
      .eq("id", transaction.gift_item_id);

    if (giftError) throw giftError;

    return new Response(
      JSON.stringify({ success: true, reference: refundData.data.reference }),
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