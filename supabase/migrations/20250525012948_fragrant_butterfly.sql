/*
  # Fix Photos RLS Policies

  1. Changes
    - Add new RLS policy to allow users to upload photos for their events
    - Ensure policy checks event ownership during upload
    - Keep existing policies for managing photos

  2. Security
    - Users can only upload photos to events they own
    - Maintains existing security for photo management
*/

-- First remove the existing ALL policy as it's too restrictive
DROP POLICY IF EXISTS "Users can CRUD photos for their events" ON photos;

-- Create separate policies for different operations
CREATE POLICY "Users can insert photos for their events"
ON photos
FOR INSERT
TO authenticated
WITH CHECK (
  event_id IN (
    SELECT id 
    FROM events 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their event photos"
ON photos
FOR SELECT
TO authenticated
USING (
  event_id IN (
    SELECT id 
    FROM events 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update and delete their photos"
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