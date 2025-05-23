import { supabase } from './supabase';

export async function getEventAnalytics(eventId: string) {
  try {
    const [
      { count: totalGuests },
      { count: confirmedRsvps },
      { count: declinedRsvps },
      { data: giftStats }
    ] = await Promise.all([
      supabase.from('guests').select('*', { count: 'exact' }).eq('event_id', eventId),
      supabase.from('rsvps').select('*', { count: 'exact' }).eq('status', 'attending'),
      supabase.from('rsvps').select('*', { count: 'exact' }).eq('status', 'declined'),
      supabase.from('transactions').select('amount').eq('status', 'completed')
    ]);

    const totalGifts = giftStats?.reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      totalGuests,
      confirmedRsvps,
      declinedRsvps,
      totalGifts,
      responseRate: totalGuests ? (confirmedRsvps + declinedRsvps) / totalGuests : 0
    };
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
}