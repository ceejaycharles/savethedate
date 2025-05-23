import { supabase } from './supabase';
import { subscriptionTiers } from './utils';

export async function getCurrentSubscription(userId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      tier:subscription_tiers(*),
      payment_method:payment_methods(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) throw error;
  return data;
}

export async function upgradeSubscription(userId: string, tierId: number, billingCycle: 'monthly' | 'yearly') {
  const { data: paymentMethod } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (!paymentMethod) {
    throw new Error('No default payment method found');
  }

  const { data: tier } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('id', tierId)
    .single();

  if (!tier) {
    throw new Error('Invalid subscription tier');
  }

  const amount = billingCycle === 'monthly' ? tier.monthly_price : tier.annual_price;
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + (billingCycle === 'monthly' ? 1 : 12));

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      tier_id: tierId,
      billing_cycle: billingCycle,
      start_date: new Date().toISOString(),
      end_date: nextBillingDate.toISOString(),
      next_billing_date: nextBillingDate.toISOString(),
      payment_method_id: paymentMethod.id,
      status: 'active'
    });

  if (error) throw error;

  // Update user's subscription tier
  await supabase
    .from('users')
    .update({ subscription_tier_id: tierId })
    .eq('id', userId);

  return { success: true };
}

export async function cancelSubscription(userId: string) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'cancelled',
      end_date: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;

  // Reset user to free tier
  await supabase
    .from('users')
    .update({ subscription_tier_id: 1 })
    .eq('id', userId);

  return { success: true };
}

export async function getUpgradePromotion(currentTierId: number) {
  const currentTierIndex = subscriptionTiers.findIndex(tier => tier.id === currentTierId);
  const nextTier = subscriptionTiers[currentTierIndex + 1];

  if (!nextTier) return null;

  return {
    currentTier: subscriptionTiers[currentTierIndex],
    nextTier,
    discount: 20, // 20% off for first 3 months
    duration: 3 // months
  };
}