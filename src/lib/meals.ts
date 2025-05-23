import { supabase } from './supabase';

export async function getMealOptions(eventId: string) {
  const { data, error } = await supabase
    .from('meal_options')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getGuestMealSelections(guestId: string) {
  const { data, error } = await supabase
    .from('guest_meals')
    .select(`
      *,
      meal:meal_options(*)
    `)
    .eq('guest_id', guestId);

  if (error) throw error;
  return data;
}

export async function saveMealSelection(guestId: string, mealId: string, quantity: number, notes?: string) {
  const { error } = await supabase
    .from('guest_meals')
    .upsert({
      guest_id: guestId,
      meal_id: mealId,
      quantity,
      notes
    });

  if (error) throw error;
  return { success: true };
}