import { supabase } from './supabase';

export async function getAdminStats() {
  try {
    const [
      { count: totalUsers },
      { count: totalEvents },
      { data: transactions }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('events').select('*', { count: 'exact' }),
      supabase.from('transactions').select('amount, fee_amount').eq('status', 'completed')
    ]);

    const totalRevenue = transactions?.reduce((sum, t) => sum + t.fee_amount, 0) || 0;

    return {
      totalUsers,
      totalEvents,
      totalRevenue,
      averageRevenuePerUser: totalUsers ? totalRevenue / totalUsers : 0
    };
  } catch (error) {
    console.error('Admin stats error:', error);
    throw error;
  }
}

export async function getSystemHealth() {
  try {
    const { data: recentErrors } = await supabase
      .from('system_logs')
      .select('*')
      .eq('level', 'error')
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      status: 'healthy',
      lastChecked: new Date().toISOString(),
      recentErrors: recentErrors || []
    };
  } catch (error) {
    console.error('System health check error:', error);
    throw error;
  }
}