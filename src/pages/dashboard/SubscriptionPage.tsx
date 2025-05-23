import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import PaymentMethodsModal from '../../components/payments/PaymentMethodsModal';
import UpgradePromotionModal from '../../components/subscription/UpgradePromotionModal';
import { getCurrentSubscription, upgradeSubscription, cancelSubscription, getUpgradePromotion } from '../../lib/subscription';
import { CreditCard, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [promotion, setPromotion] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const data = await getCurrentSubscription(user!.id);
      setSubscription(data);

      if (data?.tier_id) {
        const promo = await getUpgradePromotion(data.tier_id);
        setPromotion(promo);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tierId: string) => {
    try {
      await upgradeSubscription(user!.id, parseInt(tierId), 'monthly');
      toast.success('Subscription upgraded successfully');
      fetchSubscription();
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await cancelSubscription(user!.id);
      toast.success('Subscription cancelled successfully');
      fetchSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        {promotion && (
          <Button onClick={() => setShowUpgradeModal(true)}>
            Upgrade Plan
          </Button>
        )}
      </div>

      <div className="grid gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
                <p className="text-gray-600">
                  {subscription?.tier?.name || 'Free'} Plan
                </p>
                {subscription?.billing_cycle && (
                  <p className="text-sm text-gray-500">
                    Billed {subscription.billing_cycle}
                  </p>
                )}
              </div>
              <Package className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Payment Method</h2>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(true)}
              >
                Manage Payment Methods
              </Button>
            </div>

            {subscription?.payment_method ? (
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">
                    {subscription.payment_method.brand} •••• {subscription.payment_method.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {subscription.payment_method.exp_month}/{subscription.payment_method.exp_year}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No payment method on file</p>
            )}
          </CardContent>
        </Card>

        {subscription?.status === 'active' && subscription.tier_id !== 1 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel Subscription
            </Button>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <PaymentMethodsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          userId={user!.id}
        />
      )}

      {showUpgradeModal && promotion && (
        <UpgradePromotionModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={subscription?.tier_id}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
}