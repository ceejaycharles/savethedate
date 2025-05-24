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
        guest:guests(*)
      `)
      .eq("event_id", eventId)
      .is("rsvp", null);

    if (!invitations?.length) {
      return new Response(
        JSON.stringify({ message: "No pending RSVPs found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Send reminders
    const emailPromises = invitations.map(async (invitation) => {
      try {
        const invitationLink = `${Deno.env.get("PUBLIC_SITE_URL")}/rsvp/${invitation.invitation_link}`;

        await resend.emails.send({
          from: "SaveTheDate <noreply@savethedate.ng>",
          to: invitation.guest.email,
          subject: `Reminder: Please RSVP for ${invitation.event.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4F46E5;">RSVP Reminder</h1>
              <p>Dear ${invitation.guest.name},</p>
              <p>This is a friendly reminder to RSVP for ${invitation.event.name}.</p>
              <div style="margin: 24px 0;">
                <p><strong>When:</strong> ${new Date(invitation.event.date_start).toLocaleString()}</p>
                <p><strong>Where:</strong> ${invitation.event.location}</p>
                ${invitation.event.description ? `<p><strong>Details:</strong> ${invitation.event.description}</p>` : ''}
              </div>
              <a href="${invitationLink}" 
                 style="display: inline-block; background-color: #4F46E5; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Click here to RSVP
              </a>
            </div>
          `,
        });

        // Log successful send
        await supabaseClient
          .from("system_logs")
          .insert({
            level: "info",
            message: "Reminder email sent successfully",
            metadata: {
              event_id: eventId,
              guest_id: invitation.guest.id,
              invitation_id: invitation.id,
            },
          });

      } catch (error) {
        // Log error
        await supabaseClient
          .from("system_logs")
          .insert({
            level: "error",
            message: "Failed to send reminder email",
            metadata: {
              error: error.message,
              event_id: eventId,
              guest_id: invitation.guest.id,
              invitation_id: invitation.id,
            },
          });

        throw error;
      }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ success: true, count: invitations.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending reminders:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});