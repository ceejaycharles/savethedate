/*
  # Add automated billing support

  1. Changes
    - Add billing_cycle field to user_subscriptions
    - Add next_billing_date field to user_subscriptions
    - Add payment_method_id field to user_subscriptions
    - Add foreign key constraint to payment_methods table

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly'::text,
ADD COLUMN IF NOT EXISTS next_billing_date timestamptz,
ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL;

-- Create index for efficient billing queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_next_billing_date 
ON user_subscriptions(next_billing_date) 
WHERE status = 'active';