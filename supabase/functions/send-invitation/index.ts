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

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { eventId, guestIds } = await req.json();

    if (!eventId || !guestIds?.length) {
      throw new Error("Missing required parameters");
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select(`
        *,
        host:users!events_user_id_fkey(
          full_name,
          email
        )
      `)
      .eq("id", eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) throw new Error("Event not found");

    // Get guest details
    const { data: guests, error: guestsError } = await supabaseClient
      .from("guests")
      .select("*")
      .in("id", guestIds);

    if (guestsError) throw guestsError;
    if (!guests?.length) throw new Error("No guests found");

    // Send invitations
    const results = await Promise.allSettled(
      guests.map(async (guest) => {
        try {
          // Create invitation record
          const invitationId = crypto.randomUUID();
          const { error: invitationError } = await supabaseClient
            .from("invitations")
            .insert({
              id: invitationId,
              event_id: eventId,
              guest_id: guest.id,
              status: "sent",
              invitation_link: invitationId,
            });

          if (invitationError) throw invitationError;

          // Send email
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: "SaveTheDate <invites@savethedate.ng>",
            to: guest.email,
            subject: `You're invited to ${event.name}!`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>You're Invited!</title>
                </head>
                <body style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4F46E5; margin-bottom: 10px;">You're Invited!</h1>
                    <p style="font-size: 18px; color: #374151;">
                      ${event.host.full_name} has invited you to ${event.name}
                    </p>
                  </div>

                  <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="color: #1F2937; margin-bottom: 15px;">Event Details</h2>
                    <p><strong>When:</strong> ${new Date(event.date_start).toLocaleString()}</p>
                    <p><strong>Where:</strong> ${event.location}</p>
                    ${event.description ? `<p><strong>Details:</strong> ${event.description}</p>` : ''}
                  </div>

                  <div style="text-align: center;">
                    <a href="${Deno.env.get("PUBLIC_SITE_URL")}/rsvp/${invitationId}"
                       style="display: inline-block; background-color: #4F46E5; color: white; 
                              padding: 12px 24px; text-decoration: none; border-radius: 6px;
                              font-weight: 500;">
                      Click here to RSVP
                    </a>
                  </div>
                </body>
              </html>
            `,
          });

          if (emailError) throw emailError;

          // Log success
          await supabaseClient
            .from("system_logs")
            .insert({
              level: "info",
              message: "Invitation sent successfully",
              metadata: {
                event_id: eventId,
                guest_id: guest.id,
                invitation_id: invitationId,
                email_id: emailData?.id,
              },
            });

          return { success: true, guest_id: guest.id };
        } catch (error) {
          // Log error
          await supabaseClient
            .from("system_logs")
            .insert({
              level: "error",
              message: "Failed to send invitation",
              metadata: {
                error: error.message,
                event_id: eventId,
                guest_id: guest.id,
              },
            });

          throw error;
        }
      })
    );

    // Check results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: failed > 0 ? 207 : 200,
      }
    );
  } catch (error) {
    console.error("Error sending invitations:", error);

    // Log system error
    await supabaseClient
      .from("system_logs")
      .insert({
        level: "error",
        message: "System error while sending invitations",
        metadata: {
          error: error.message,
          event_id: eventId,
        },
      });

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});