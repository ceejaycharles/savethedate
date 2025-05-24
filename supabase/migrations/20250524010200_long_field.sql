/*
  # Fix user creation flow

  1. Changes
    - Update trigger function to handle null values
    - Add error handling for user creation
    - Add default subscription tier
    - Add RLS policies for users table

  2. Security
    - Enable RLS on users table
    - Add policies for user access
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    subscription_tier_id
  )
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    1  -- Default to free tier
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error and re-raise
    INSERT INTO system_logs (level, message, metadata)
    VALUES (
      'error',
      'Failed to create user profile',
      jsonb_build_object(
        'user_id', new.id,
        'error', SQLERRM
      )
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);