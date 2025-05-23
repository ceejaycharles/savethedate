import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { DollarSign, ArrowDown, ArrowUp } from 'lucide-react';

interface PayoutSummaryCardProps {
  totalAmount: number;
  pendingAmount: number;
  completedPayouts: number;
  onInitiatePayout: () => void;
  loading?: boolean;
}

export function PayoutSummaryCard({
  totalAmount,
  pendingAmount,
  completedPayouts,
  onInitiatePayout,
  loading = false,
}: PayoutSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Payout Summary</h3>
          <Button
            onClick={onInitiatePayout}
            disabled={pendingAmount === 0 || loading}
            isLoading={loading}
          >
            Initiate Payout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Received
            </div>
            <p className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-warning-600">
              <ArrowDown className="w-4 h-4 mr-2" />
              Pending Payout
            </div>
            <p className="text-2xl font-bold">₦{pendingAmount.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-success-600">
              <ArrowUp className="w-4 h-4 mr-2" />
              Completed Payouts
            </div>
            <p className="text-2xl font-bold">₦{completedPayouts.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}