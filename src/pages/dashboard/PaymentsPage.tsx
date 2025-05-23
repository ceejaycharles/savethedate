import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PayoutSummaryCard } from '../../components/payments/PayoutSummaryCard';
import { TransactionList } from '../../components/payments/TransactionList';
import { supabase } from '../../lib/supabase';
import { getPayoutSummary, initiatePayout } from '../../lib/payouts';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [initiatingPayout, setInitiatingPayout] = useState(false);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    completedPayouts: 0,
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [summaryData, transactionsData] = await Promise.all([
        getPayoutSummary(eventId!),
        supabase
          .from('transactions')
          .select('*, gift_item:gift_items(name)')
          .eq('gift_item_id', 'in', (
            supabase
              .from('gift_items')
              .select('id')
              .eq('event_id', eventId)
          ))
          .order('created_at', { ascending: false })
      ]);

      setSummary(summaryData);
      setTransactions(transactionsData.data || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayout = async () => {
    setInitiatingPayout(true);
    try {
      await initiatePayout(eventId!);
      toast.success('Payout initiated successfully');
      fetchData();
    } catch (error) {
      console.error('Error initiating payout:', error);
      toast.error('Failed to initiate payout');
    } finally {
      setInitiatingPayout(false);
    }
  };

  const handleExportTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          status,
          payout_status,
          created_at,
          gift_item:gift_items(name)
        `)
        .eq('gift_item_id', 'in', (
          supabase
            .from('gift_items')
            .select('id')
            .eq('event_id', eventId)
        ));

      if (error) throw error;

      const csvContent = data.map(tx => ({
        'Gift Item': tx.gift_item.name,
        'Amount': tx.amount,
        'Status': tx.status,
        'Payout Status': tx.payout_status,
        'Date': new Date(tx.created_at).toLocaleString(),
      }));

      // Create CSV and trigger download
      const csv = Papa.unparse(csvContent);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'transactions.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments & Payouts</h1>
        <p className="text-gray-600 mt-1">Manage your event's financial transactions</p>
      </div>

      <div className="space-y-8">
        <PayoutSummaryCard
          {...summary}
          onInitiatePayout={handleInitiatePayout}
          loading={initiatingPayout}
        />

        <TransactionList
          transactions={transactions}
          onExport={handleExportTransactions}
        />
      </div>
    </div>
  );
}