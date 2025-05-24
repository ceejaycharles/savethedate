import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    amount: number;
    paystack_reference: string;
  };
}

export function RefundModal({ isOpen, onClose, transaction }: RefundModalProps) {
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleRefund = async () => {
    try {
      setProcessing(true);

      const { error } = await supabase.functions.invoke('process-refund', {
        body: { 
          transactionId: transaction.id,
          reason 
        }
      });

      if (error) throw error;

      toast.success('Refund initiated successfully');
      onClose();
    } catch (error) {
      console.error('Refund error:', error);
      toast.error('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Process Refund</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Refund amount:</p>
            <p className="text-2xl font-bold">₦{transaction.amount.toLocaleString()}</p>
          </div>

          <Input
            label="Reason for Refund"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            as="textarea"
            required
          />

          <p className="text-sm text-gray-500">
            The refund will be processed back to the original payment method.
            This may take 5-10 business days to complete.
          </p>

          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline" disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              isLoading={processing}
              disabled={!reason.trim()}
            >
              Process Refund
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundModal;