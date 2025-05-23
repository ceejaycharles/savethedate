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
    // Verify Paystack webhook signature
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      throw new Error("No signature found");
    }

    const payload = await req.json();
    const event = payload.event;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    switch (event) {
      case "charge.success": {
        // Update transaction status
        const { error: transactionError } = await supabaseClient
          .from("transactions")
          .update({
            status: "completed",
            payout_status: "pending",
          })
          .eq("paystack_reference", payload.data.reference);

        if (transactionError) throw transactionError;

        // Update gift item purchased quantity
        const { data: transaction } = await supabaseClient
          .from("transactions")
          .select("gift_item_id")
          .eq("paystack_reference", payload.data.reference)
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
        break;
      }

      case "transfer.success": {
        // Update payout status
        const { error: payoutError } = await supabaseClient
          .from("transactions")
          .update({
            payout_status: "completed",
          })
          .eq("payout_reference", payload.data.reference);

        if (payoutError) throw payoutError;
        break;
      }

      case "transfer.failed": {
        // Update payout status and notify admin
        const { error: payoutError } = await supabaseClient
          .from("transactions")
          .update({
            payout_status: "failed",
          })
          .eq("payout_reference", payload.data.reference);

        if (payoutError) throw payoutError;

        // Log the failure
        await supabaseClient
          .from("system_logs")
          .insert({
            level: "error",
            message: "Payout failed",
            metadata: {
              reference: payload.data.reference,
              reason: payload.data.reason,
            },
          });
        break;
      }
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