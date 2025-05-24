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

    if (!event) {
      throw new Error("Event not found");
    }

    // Get guest details
    const { data: guests } = await supabaseClient
      .from("guests")
      .select("*")
      .in("id", guestIds);

    if (!guests?.length) {
      throw new Error("No guests found");
    }

    // Send invitations
    const emailPromises = guests.map(async (guest) => {
      try {
        // Create invitation record
        const { data: invitation } = await supabaseClient
          .from("invitations")
          .insert({
            event_id: eventId,
            guest_id: guest.id,
            status: "sent",
            invitation_link: crypto.randomUUID(),
          })
          .select()
          .single();

        if (!invitation) {
          throw new Error("Failed to create invitation");
        }

        const invitationLink = `${Deno.env.get("PUBLIC_SITE_URL")}/rsvp/${invitation.invitation_link}`;

        // Send email using Resend
        await resend.emails.send({
          from: "SaveTheDate <noreply@savethedate.ng>",
          to: guest.email,
          subject: `You're invited to ${event.name}!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4F46E5;">You're Invited!</h1>
              <p>Dear ${guest.name},</p>
              <p>${event.users.full_name} has invited you to ${event.name}.</p>
              <div style="margin: 24px 0;">
                <p><strong>When:</strong> ${new Date(event.date_start).toLocaleString()}</p>
                <p><strong>Where:</strong> ${event.location}</p>
                ${event.description ? `<p><strong>Details:</strong> ${event.description}</p>` : ''}
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
            message: "Invitation email sent successfully",
            metadata: {
              event_id: eventId,
              guest_id: guest.id,
              invitation_id: invitation.id,
            },
          });

      } catch (error) {
        // Log error
        await supabaseClient
          .from("system_logs")
          .insert({
            level: "error",
            message: "Failed to send invitation email",
            metadata: {
              error: error.message,
              event_id: eventId,
              guest_id: guest.id,
            },
          });

        throw error;
      }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ success: true, count: guests.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending invitations:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});