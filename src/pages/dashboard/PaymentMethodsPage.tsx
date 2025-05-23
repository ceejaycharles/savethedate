import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import PaymentMethodsModal from '../../components/payments/PaymentMethodsModal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CreditCard, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : paymentMethods.length === 0 ? (
        <Card className="text-center p-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Payment Methods</h2>
          <p className="text-gray-600 mb-4">Add a payment method to manage your subscriptions.</p>
          <Button onClick={() => setShowModal(true)}>
            Add Your First Payment Method
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
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
                  {method.is_default && (
                    <span className="text-sm text-primary-600 font-medium">
                      Default
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <PaymentMethodsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          userId={user?.id}
        />
      )}
    </div>
  );
}