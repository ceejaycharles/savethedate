/*
  # Fix users table RLS policies

  1. Changes
    - Add RLS policy to allow users to read their own role
    - Ensure users can only read their own profile information

  2. Security
    - Enable RLS on users table (if not already enabled)
    - Add policy for users to read their own data
*/

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add policy for users to read their own role
CREATE POLICY "Users can read their own role"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);