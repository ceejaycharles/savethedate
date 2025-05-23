import { supabase } from './supabase';

export async function addBudgetItem(eventId: string, data: {
  category: string;
  itemName: string;
  estimatedAmount: number;
  actualAmount?: number;
  paidAmount?: number;
  notes?: string;
}) {
  const { error } = await supabase
    .from('event_budgets')
    .insert({
      event_id: eventId,
      category: data.category,
      item_name: data.itemName,
      estimated_amount: data.estimatedAmount,
      actual_amount: data.actualAmount,
      paid_amount: data.paidAmount,
      notes: data.notes
    });

  if (error) throw error;
  return { success: true };
}

export async function getBudgetSummary(eventId: string) {
  const { data, error } = await supabase
    .from('event_budgets')
    .select('*')
    .eq('event_id', eventId);

  if (error) throw error;

  const summary = {
    totalEstimated: 0,
    totalActual: 0,
    totalPaid: 0,
    categories: {}
  };

  data?.forEach(item => {
    summary.totalEstimated += item.estimated_amount;
    summary.totalActual += item.actual_amount || 0;
    summary.totalPaid += item.paid_amount || 0;

    if (!summary.categories[item.category]) {
      summary.categories[item.category] = {
        estimated: 0,
        actual: 0,
        paid: 0
      };
    }

    summary.categories[item.category].estimated += item.estimated_amount;
    summary.categories[item.category].actual += item.actual_amount || 0;
    summary.categories[item.category].paid += item.paid_amount || 0;
  });

  return summary;
}