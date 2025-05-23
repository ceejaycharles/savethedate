import { supabase } from './supabase';

export async function scheduleReminders(eventId: string) {
  const { data: pendingRsvps } = await supabase
    .from('invitations')
    .select('*')
    .eq('event_id', eventId)
    .is('rsvp', null);

  if (!pendingRsvps?.length) return;

  const { error } = await supabase.functions.invoke('send-reminder', {
    body: { eventId }
  });

  if (error) throw error;
  return { success: true };
}