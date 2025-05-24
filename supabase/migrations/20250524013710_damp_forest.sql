/*
  # Fix users table permissions

  1. Changes
    - Add policy for users to read their own data
    - Add policy for admins to manage all profiles
    - Enable RLS on users table

  2. Security
    - Users can only read their own data
    - Admins have full access to all profiles
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own role" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON users;

-- Create new policies
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

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