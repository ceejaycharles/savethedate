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
    const { eventId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get all completed transactions for the event that haven't been paid out
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("status", "completed")
      .eq("payout_status", "pending");

    if (!transactions?.length) {
      return new Response(
        JSON.stringify({ message: "No pending payouts" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate total payout amount
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount - tx.fee_amount), 0);

    // Initialize payout with Paystack
    const payoutResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(totalAmount * 100), // Convert to kobo
        recipient: eventId, // Assuming recipient code is stored in event
      }),
    });

    const payoutData = await payoutResponse.json();

    if (!payoutData.status) {
      throw new Error("Payout initialization failed");
    }

    // Update transaction records
    const { error: updateError } = await supabaseClient
      .from("transactions")
      .update({
        payout_status: "completed",
        payout_reference: payoutData.data.reference,
      })
      .in(
        "id",
        transactions.map((tx) => tx.id)
      );

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, reference: payoutData.data.reference }),
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