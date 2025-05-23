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
    const { reference } = await req.json();

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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Update transaction status
    const { error: transactionError } = await supabaseClient
      .from("transactions")
      .update({
        status: "completed",
        payout_status: "pending",
      })
      .eq("paystack_reference", reference);

    if (transactionError) throw transactionError;

    // Update gift item purchased quantity
    const { data: transaction } = await supabaseClient
      .from("transactions")
      .select("gift_item_id")
      .eq("paystack_reference", reference)
      .single();

    if (transaction) {
      const { error: giftError } = await supabaseClient
        .from("gift_items")
        .update({
          purchased_quantity: supabaseClient.sql`purchased_quantity + 1`,
        })
        .eq("id", transaction.gift_item_id);

      if (giftError) throw giftError;
    }

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