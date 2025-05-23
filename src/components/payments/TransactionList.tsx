import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  payout_status: string;
  created_at: string;
  gift_item: {
    name: string;
  };
}

interface TransactionListProps {
  transactions: Transaction[];
  onExport: () => void;
}

export function TransactionList({ transactions, onExport }: TransactionListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-error-500" />;
      default:
        return <Clock className="w-5 h-5 text-warning-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Button variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-full mr-4">
                  <DollarSign className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="font-medium">{transaction.gift_item.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium">₦{transaction.amount.toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    {getStatusIcon(transaction.status)}
                    <span className="ml-1 capitalize">{transaction.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}