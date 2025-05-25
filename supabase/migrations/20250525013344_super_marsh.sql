/*
  # Fix Photos RLS Policies

  1. Changes
    - Drop existing RLS policies for photos table
    - Create new comprehensive RLS policies that properly handle all cases:
      - Event owners can manage all photos for their events
      - Guests can upload photos to events they're invited to
      - Public can view photos for public events
      - Users can view photos for events they're invited to

  2. Security
    - Enable RLS on photos table (already enabled)
    - Add policies for different access levels
    - Ensure proper event ownership checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow photo uploads" ON photos;
DROP POLICY IF EXISTS "Allow photo viewing" ON photos;
DROP POLICY IF EXISTS "Anyone can view public photos" ON photos;
DROP POLICY IF EXISTS "Users can update and delete their photos" ON photos;
DROP POLICY IF EXISTS "Users can view their event photos" ON photos;

-- Create new comprehensive policies
CREATE POLICY "Event owners can manage photos"
ON photos
FOR ALL
TO authenticated
USING (
  event_id IN (
    SELECT id 
    FROM events 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  event_id IN (
    SELECT id 
    FROM events 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Guests can upload photos"
ON photos
FOR INSERT
TO authenticated
WITH CHECK (
  event_id IN (
    SELECT i.event_id
    FROM invitations i
    JOIN guests g ON i.guest_id = g.id
    WHERE g.email = auth.email()
  )
);

CREATE POLICY "Public can view photos for public events"
ON photos
FOR SELECT
TO public
USING (
  event_id IN (
    SELECT id
    FROM events
    WHERE privacy_setting = 'public'
  )
  OR
  privacy_setting = 'public'
);

CREATE POLICY "Invited users can view event photos"
ON photos
FOR SELECT
TO authenticated
USING (
  event_id IN (
    SELECT i.event_id
    FROM invitations i
    JOIN guests g ON i.guest_id = g.id
    WHERE g.email = auth.email()
  )
);