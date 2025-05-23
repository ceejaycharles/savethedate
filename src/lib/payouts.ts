import { supabase } from './supabase';

export async function processPayout(userId: string) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('payout_status', 'pending');

  if (!transactions?.length) return { success: true, amount: 0 };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount - t.fee_amount, 0);

  const { error } = await supabase.functions.invoke('process-payout', {
    body: { userId, amount: totalAmount }
  });

  if (error) throw error;
  return { success: true, amount: totalAmount };
}