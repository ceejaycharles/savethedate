import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  totalAmount: number;
}

export function PayoutModal({ isOpen, onClose, eventId, totalAmount }: PayoutModalProps) {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayout = async () => {
    try {
      setProcessing(true);

      const { error } = await supabase.functions.invoke('process-payout', {
        body: { eventId }
      });

      if (error) throw error;

      toast.success('Payout initiated successfully');
      onClose();
    } catch (error) {
      console.error('Payout error:', error);
      toast.error('Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Initiate Payout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Available for payout:</p>
            <p className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</p>
          </div>

          <p className="text-sm text-gray-500">
            This amount will be transferred to your registered bank account.
            Processing typically takes 1-2 business days.
          </p>

          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline" disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handlePayout}
              isLoading={processing}
            >
              Initiate Payout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayoutModal;