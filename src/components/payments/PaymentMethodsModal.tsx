import React, { useState, useEffect } from 'react';
import { X, CreditCard, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  brand: string;
}

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function PaymentMethodsModal({ isOpen, onClose, userId }: PaymentMethodsModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const { data: methods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setPaymentMethods(methods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      // Initialize Paystack inline
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        onSuccess: async (response: any) => {
          const { data, error } = await supabase
            .from('payment_methods')
            .insert({
              user_id: userId,
              paystack_authorization_code: response.authorization.authorization_code,
              last4: response.authorization.last4,
              exp_month: response.authorization.exp_month,
              exp_year: response.authorization.exp_year,
              brand: response.authorization.card_type,
            });

          if (error) throw error;
          fetchPaymentMethods();
          toast.success('Card added successfully');
        },
        onClose: () => {
          setAdding(false);
        }
      });
      handler.openIframe();
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card');
      setAdding(false);
    }
  };

  const handleRemoveCard = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;
      setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
      toast.success('Card removed successfully');
    } catch (error) {
      console.error('Error removing card:', error);
      toast.error('Failed to remove card');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Payment Methods</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {method.exp_month}/{method.exp_year}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCard(method.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                onClick={handleAddCard}
                className="w-full"
                disabled={adding}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Card
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodsModal;