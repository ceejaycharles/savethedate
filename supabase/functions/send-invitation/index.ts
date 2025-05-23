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
    const { eventId, guestIds } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get event details
    const { data: event } = await supabaseClient
      .from("events")
      .select("*, users(full_name)")
      .eq("id", eventId)
      .single();

    // Get guest details
    const { data: guests } = await supabaseClient
      .from("guests")
      .select("*")
      .in("id", guestIds);

    // Send invitations
    for (const guest of guests) {
      const invitationLink = `${Deno.env.get("PUBLIC_SITE_URL")}/rsvp/${guest.id}`;

      await resend.emails.send({
        from: "SaveTheDate <noreply@savethedate.ng>",
        to: guest.email,
        subject: `You're invited to ${event.name}!`,
        html: `
          <h1>You're Invited!</h1>
          <p>Dear ${guest.name},</p>
          <p>${event.users.full_name} has invited you to ${event.name}.</p>
          <p>When: ${new Date(event.date_start).toLocaleString()}</p>
          <p>Where: ${event.location}</p>
          <p><a href="${invitationLink}">Click here to RSVP</a></p>
        `,
      });

      // Update invitation status
      await supabaseClient
        .from("invitations")
        .update({ status: "sent" })
        .eq("guest_id", guest.id);
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