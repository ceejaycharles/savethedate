import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";
import { Resend } from "npm:resend@2.1.0";

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

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get event details with pending RSVPs
    const { data: invitations } = await supabaseClient
      .from("invitations")
      .select(`
        *,
        event:events(*),
        guest:guests(*),
        rsvp:rsvps(*)
      `)
      .eq("event_id", eventId)
      .is("rsvp", null);

    // Send reminders
    for (const invitation of invitations) {
      await resend.emails.send({
        from: "SaveTheDate <noreply@savethedate.ng>",
        to: invitation.guest.email,
        subject: `Reminder: Please RSVP for ${invitation.event.name}`,
        html: `
          <h1>RSVP Reminder</h1>
          <p>Dear ${invitation.guest.name},</p>
          <p>This is a friendly reminder to RSVP for ${invitation.event.name}.</p>
          <p>When: ${new Date(invitation.event.date_start).toLocaleString()}</p>
          <p>Where: ${invitation.event.location}</p>
          <p><a href="${Deno.env.get("PUBLIC_SITE_URL")}/rsvp/${invitation.id}">Click here to RSVP</a></p>
        `,
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: invitations.length }),
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