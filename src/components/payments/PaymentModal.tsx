import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { initializePayment } from '../../lib/paystack';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftItem: {
    id: string;
    name: string;
    desired_price: number;
    event_id: string;
  };
  userEmail: string;
}

export function PaymentModal({ isOpen, onClose, giftItem, userEmail }: PaymentModalProps) {
  const [amount, setAmount] = useState(giftItem.desired_price);
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      setProcessing(true);

      const paymentData = await initializePayment({
        email: userEmail,
        amount,
        metadata: {
          gift_item_id: giftItem.id,
          event_id: giftItem.event_id,
        },
      });

      // Redirect to Paystack checkout
      window.location.href = paymentData.authorization_url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contribute to Gift</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{giftItem.name}</h3>
            <p className="text-sm text-gray-500">
              Suggested amount: ₦{giftItem.desired_price.toLocaleString()}
            </p>
          </div>

          <Input
            type="number"
            label="Contribution Amount (₦)"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            required
          />

          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline" disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              isLoading={processing}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}