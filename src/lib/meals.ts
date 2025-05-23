import { supabase } from './supabase';

export async function createMealOption(eventId: string, data: {
  name: string;
  description?: string;
  dietaryInfo?: string;
  maxQuantity?: number;
}) {
  const { error } = await supabase
    .from('meal_options')
    .insert({
      event_id: eventId,
      ...data
    });

  if (error) throw error;
  return { success: true };
}

export async function updateGuestMeal(guestId: string, mealId: string, quantity: number) {
  const { error } = await supabase
    .from('guest_meals')
    .upsert({
      guest_id: guestId,
      meal_id: mealId,
      quantity
    });

  if (error) throw error;
  return { success: true };
}