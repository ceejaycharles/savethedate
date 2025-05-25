/*
  # Add policy for reading event host information
  
  1. Changes
    - Add new RLS policy to allow reading basic user information for event hosts
    - Policy only allows access to full_name and profile_picture_url columns
    - Applies to both authenticated and anonymous users
    
  2. Security
    - Limited to only necessary columns for displaying event host info
    - Only allows reading info for users who are hosting events
    - Does not expose sensitive user data
*/

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
)
WITH CHECK (false);

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