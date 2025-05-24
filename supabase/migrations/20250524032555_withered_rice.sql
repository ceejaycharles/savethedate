/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies for user operations
    - Add policy for admins
  
  2. Security
    - Enable RLS on users table
    - Ensure users can only access their own records
    - Allow admins full access based on app_metadata
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;

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