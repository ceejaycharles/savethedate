import { supabase } from './supabase';

export interface ShareOptions {
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'email';
  eventId: string;
  customMessage?: string;
}

export async function shareEvent({ platform, eventId, customMessage }: ShareOptions) {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!event) throw new Error('Event not found');

    const shareUrl = `${window.location.origin}/events/${eventId}`;
    const message = customMessage || `Join me at ${event.name}!`;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(`${message}\n\n${shareUrl}`)}`
    };

    // Track share event
    await supabase.from('event_shares').insert({
      event_id: eventId,
      platform,
      shared_at: new Date().toISOString()
    });

    // Open share dialog
    window.open(urls[platform], '_blank');
    return { success: true };
  } catch (error) {
    console.error('Share event error:', error);
    throw error;
  }
}

export async function getShareStats(eventId: string) {
  try {
    const { data } = await supabase
      .from('event_shares')
      .select('platform, count')
      .eq('event_id', eventId)
      .group_by('platform');

    return data?.reduce((acc, { platform, count }) => ({
      ...acc,
      [platform]: count
    }), {}) || {};
  } catch (error) {
    console.error('Share stats error:', error);
    throw error;
  }
}