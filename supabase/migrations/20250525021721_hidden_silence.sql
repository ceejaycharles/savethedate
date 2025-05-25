/*
  # Add policy for viewing event host information

  1. Security
    - Add policy to allow reading basic user info for event hosts
    - Create security definer function for safe host info access

  2. Changes
    - Add SELECT policy on users table for public access
    - Create get_event_host_info function
*/

-- Add policy to allow reading host information for public events
CREATE POLICY "Anyone can view event host information"
ON users
FOR SELECT
TO public
USING (
  id IN (
    SELECT user_id 
    FROM events 
    WHERE privacy_setting = 'public'
  )
);

-- Create a security definer function to safely get host information
CREATE OR REPLACE FUNCTION public.get_event_host_info(host_id uuid)
RETURNS TABLE (
  full_name text,
  profile_picture_url text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.full_name,
    u.profile_picture_url
  FROM users u
  WHERE u.id = host_id
  AND EXISTS (
    SELECT 1 
    FROM events e 
    WHERE e.user_id = host_id 
    AND e.privacy_setting = 'public'
  );
END;
$$;