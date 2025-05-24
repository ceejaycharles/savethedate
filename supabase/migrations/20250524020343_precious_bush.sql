/*
  # Add RLS policies for users table

  1. Changes
    - Add policy to allow users to insert their own record
    - Add policy to allow users to view their own record
    - Add policy to allow users to update their own record

  2. Security
    - Policies ensure users can only access their own data
    - Admins retain full access through existing policy
*/

-- Policy to allow users to insert their own record
CREATE POLICY "Users can insert their own record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy to allow users to view their own record
CREATE POLICY "Users can view their own record"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy to allow users to update their own record
CREATE POLICY "Users can update their own record"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);