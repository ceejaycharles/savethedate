import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { subscriptionTiers } from '../lib/utils';

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const toggleBillingPeriod = () => {
    setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your event needs. All plans include core features.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-lg shadow-sm inline-flex">
            <button
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly
              <span className="ml-2 bg-accent-100 text-accent-800 text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="border-2 border-gray-200 relative hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-gray-500 mb-6">For personal events</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">₦0</span>
                <span className="text-gray-500">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Up to 2 active events</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Up to 50 guests per event</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Basic invitation templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>5% transaction fee on gifts</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Standard email support</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                  <span className="text-gray-400">Premium templates</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                  <span className="text-gray-400">Priority support</span>
                </li>
              </ul>
              
              <Link to="/register">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Silver Tier */}
          <Card className="border-2 border-primary-400 relative transform hover:scale-105 transition-all duration-300 shadow-lg">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">Silver</h3>
              <p className="text-gray-500 mb-6">For multiple events</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {formatPrice(billingPeriod === 'monthly' ? 2500 : 2000 * 12)}
                </span>
                <span className="text-gray-500">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Up to 5 active events</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Up to 250 guests per event</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Premium invitation templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>3% transaction fee on gifts</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                  <span className="text-gray-400">Custom domain mapping</span>
                </li>
              </ul>
              
              <Link to="/register">
                <Button variant="primary" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Gold Tier */}
          <Card className="border-2 border-accent-400 relative hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">Gold</h3>
              <p className="text-gray-500 mb-6">For power users</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {formatPrice(billingPeriod === 'monthly' ? 5000 : 4000 * 12)}
                </span>
                <span className="text-gray-500">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Unlimited active events</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Unlimited guests per event</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>All premium templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>1.5% transaction fee on gifts</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0" />
                  <span>Custom domain mapping</span>
                </li>
              </ul>
              
              <Link to="/register">
                <Button variant="accent" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">How do transaction fees work?</h3>
              <p className="text-gray-600">
                Transaction fees are applied to gift payments processed through our platform. The percentage varies based on your subscription tier (Free: 5%, Silver: 3%, Gold: 1.5%). These fees help us maintain our payment infrastructure and provide secure transaction processing.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference for the remainder of your billing cycle. When downgrading, your new plan will take effect at the start of your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept credit/debit cards, bank transfers, and other payment methods supported by Paystack in Nigeria. All transactions are processed securely through Paystack's platform.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">What happens when I reach my event or guest limit?</h3>
              <p className="text-gray-600">
                When you reach your plan's limits, you'll need to upgrade to a higher tier or archive existing events to create new ones. You'll receive notifications as you approach your limits.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Can I try SaveTheDate before subscribing?</h3>
              <p className="text-gray-600">
                Absolutely! Our Free tier lets you create up to 2 events with basic features, so you can experience the platform before committing to a paid subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;