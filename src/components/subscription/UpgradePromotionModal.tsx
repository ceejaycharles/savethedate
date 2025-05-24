import React from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { subscriptionTiers } from '../../lib/utils';

interface UpgradePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  onUpgrade: (tierId: string) => void;
}

export function UpgradePromotionModal({
  isOpen,
  onClose,
  currentTier,
  onUpgrade
}: UpgradePromotionModalProps) {
  if (!isOpen) return null;

  const currentTierIndex = subscriptionTiers.findIndex(tier => tier.id === currentTier);
  const nextTier = subscriptionTiers[currentTierIndex + 1];

  if (!nextTier) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upgrade Your Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-primary-800 font-medium">
              Special Offer: Upgrade now and get 20% off your first 3 months!
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="text-center p-4">
              <h3 className="font-medium">{subscriptionTiers[currentTierIndex].name}</h3>
              <p className="text-sm text-gray-500">Current Plan</p>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium">{nextTier.name}</h3>
              <p className="text-sm text-gray-500">Upgrade To</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">You'll get:</h4>
            {nextTier.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-5 w-5 text-success-500 mr-2" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold mb-2">
              ₦{(nextTier.price * 0.8).toLocaleString()}/month
            </p>
            <p className="text-sm text-gray-500 mb-4">
              for the first 3 months, then ₦{nextTier.price.toLocaleString()}/month
            </p>
            <Button
              onClick={() => onUpgrade(nextTier.id)}
              className="w-full"
            >
              Upgrade Now
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            By upgrading, you agree to our Terms of Service and Privacy Policy.
            You can cancel or downgrade at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UpgradePromotionModal;