/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies that properly handle role access
    - Ensure users can read their own profile data including role
    - Maintain admin access capabilities
    
  2. Security
    - Users can only read their own profile data
    - Users can only update their own profile
    - Admins retain full access to all profiles
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON users;

-- Create new simplified read policy
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Create new update policy
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create new admin policy
CREATE POLICY "Admins can manage all profiles"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND (raw_app_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'superadmin')
  )
);