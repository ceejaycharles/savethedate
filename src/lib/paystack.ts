import { supabase } from './supabase';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

interface PaystackConfig {
  email: string;
  amount: number;
  metadata: {
    gift_item_id: string;
    event_id: string;
  };
  callback_url?: string;
}

export async function initializeTransaction(config: PaystackConfig) {
  try {
    // Validate Paystack key
    if (!PAYSTACK_PUBLIC_KEY) {
      throw new Error('Paystack public key not found');
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer sk_test_${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: config.email,
        amount: Math.round(config.amount * 100), // Convert to kobo
        metadata: config.metadata,
        callback_url: config.callback_url || `${window.location.origin}/payment/callback`,
      }),
    });

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || 'Payment initialization failed');
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        gift_item_id: config.metadata.gift_item_id,
        amount: config.amount,
        paystack_reference: data.data.reference,
        status: 'pending',
      });

    if (transactionError) throw transactionError;

    return {
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
}