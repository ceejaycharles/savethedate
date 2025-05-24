/*
  # Add payment methods and subscription billing
  
  1. New Tables
    - `payment_methods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `paystack_authorization_code` (text)
      - `last4` (text)
      - `exp_month` (integer)
      - `exp_year` (integer)
      - `brand` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Changes
    - Add billing columns to user_subscriptions table
    - Add subscription renewal function
  
  3. Security
    - Enable RLS on payment_methods
    - Add policy for users to manage their payment methods
*/

-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    paystack_authorization_code text NOT NULL,
    last4 text NOT NULL,
    exp_month integer NOT NULL,
    exp_year integer NOT NULL,
    brand text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own payment methods"
    ON public.payment_methods
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Add billing_cycle column to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS next_billing_date timestamptz,
ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL;

-- Create function to handle automated billing
CREATE OR REPLACE FUNCTION process_subscription_renewal()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    subscription RECORD;
BEGIN
    -- Get subscriptions due for renewal
    FOR subscription IN 
        SELECT * FROM user_subscriptions 
        WHERE status = 'active' 
        AND next_billing_date <= now()
    LOOP
        -- Process payment using stored payment method
        -- This would typically be handled by a separate service
        -- For now, we'll just update the dates
        UPDATE user_subscriptions
        SET 
            start_date = next_billing_date,
            next_billing_date = CASE 
                WHEN billing_cycle = 'monthly' THEN next_billing_date + interval '1 month'
                WHEN billing_cycle = 'yearly' THEN next_billing_date + interval '1 year'
            END
        WHERE id = subscription.id;
    END LOOP;
END;
$$;