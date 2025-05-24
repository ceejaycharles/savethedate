/*
  # Fix User Table Policies and Triggers

  1. Changes
    - Simplify RLS policies for users table
    - Update user creation trigger to handle metadata properly
    - Add proper indexes for performance

  2. Security
    - Enable RLS on users table
    - Add policies for user CRUD operations
    - Add admin management policy
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Create simplified policies
CREATE POLICY "Users can view their own record"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own record"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON public.users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND (
      raw_app_meta_data->>'role' = 'admin' OR 
      raw_app_meta_data->>'role' = 'superadmin'
    )
  )
);

-- Drop and recreate trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
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
    1,  -- Default to free tier
    'user'  -- Default role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();