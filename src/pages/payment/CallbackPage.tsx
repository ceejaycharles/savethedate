import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../../lib/paystack';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check, X } from 'lucide-react';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      verifyPayment(reference)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {status === 'processing' ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-success-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Thank you for your contribution.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mb-4">
              <X className="h-6 w-6 text-error-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please try again.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}