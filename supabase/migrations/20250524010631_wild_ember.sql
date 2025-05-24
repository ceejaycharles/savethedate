/*
  # Fix user creation and event creation flow

  1. Changes
    - Add error handling to user creation trigger
    - Add default values for user profile
    - Update RLS policies
    - Add system logging

  2. Security
    - Enable RLS on users table
    - Add policies for user profile access
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_tier_id integer;
BEGIN
  -- Get default tier ID
  SELECT id INTO default_tier_id FROM subscription_tiers WHERE name = 'Free' LIMIT 1;

  -- Create user profile with default values
  INSERT INTO public.users (
    id,
    email,
    full_name,
    subscription_tier_id,
    role
  )
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(default_tier_id, 1),
    'user'
  );

  -- Log successful user creation
  INSERT INTO system_logs (
    level,
    message,
    metadata
  )
  VALUES (
    'info',
    'User profile created successfully',
    jsonb_build_object(
      'user_id', new.id,
      'email', new.email
    )
  );

  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error details
    INSERT INTO system_logs (
      level,
      message,
      metadata
    )
    VALUES (
      'error',
      'Failed to create user profile',
      jsonb_build_object(
        'user_id', new.id,
        'error', SQLERRM,
        'context', 'handle_new_user trigger'
      )
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );