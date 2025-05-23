import { supabase } from './supabase';

export async function sendEmail(to: string, templateId: string, data: any) {
  const { data: functionData, error } = await supabase.functions.invoke('send-email', {
    body: JSON.stringify({
      to,
      templateId,
      data,
    }),
  });

  if (error) throw error;
  return functionData;
}

export const emailTemplates = {
  INVITATION: 'invitation',
  RSVP_CONFIRMATION: 'rsvp_confirmation',
  GIFT_THANK_YOU: 'gift_thank_you',
  PASSWORD_RESET: 'password_reset',
  RSVP_REMINDER: 'rsvp_reminder',
};

export async function sendInvitation(eventId: string, guestIds: string[]) {
  const { data, error } = await supabase.functions.invoke('send-invitation', {
    body: JSON.stringify({
      eventId,
      guestIds,
    }),
  });

  if (error) throw error;
  return data;
}

export async function sendRsvpReminder(eventId: string) {
  const { data, error } = await supabase.functions.invoke('send-reminder', {
    body: JSON.stringify({
      eventId,
    }),
  });

  if (error) throw error;
  return data;
}