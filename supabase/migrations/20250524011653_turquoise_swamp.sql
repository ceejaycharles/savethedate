/*
  # Fix users table RLS policies

  1. Changes
    - Update RLS policy for users table to allow users to read their own role
    - Keep existing policies for admin access and profile updates
    - Ensure proper security by limiting access to only the user's own data

  2. Security
    - Maintain RLS enabled on users table
    - Update SELECT policy to explicitly allow role access
    - Keep existing admin policies intact
*/

-- Drop the existing "Users can read own profile" policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

-- Create updated policy that explicitly includes role column
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Note: Keep existing admin and update policies as they are correct
-- The "Admins can manage all profiles" and "Users can update own profile" policies remain unchanged