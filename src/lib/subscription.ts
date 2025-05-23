import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export async function updateSubscription(userId: string, tierId: number) {
  try {
    const { data: currentSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (currentSub) {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', currentSub.id);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        tier_id: tierId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Subscription update error:', error);
    throw error;
  }
}

export async function checkSubscriptionLimits(userId: string) {
  try {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_tiers(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription) return { allowed: false };

    const { data: eventCount } = await supabase
      .from('events')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    return {
      allowed: eventCount <= subscription.subscription_tiers.max_events,
      currentCount: eventCount,
      limit: subscription.subscription_tiers.max_events
    };
  } catch (error) {
    console.error('Subscription limit check error:', error);
    throw error;
  }
}