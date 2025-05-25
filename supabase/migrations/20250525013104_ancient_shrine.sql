/*
  # Fix photo upload policies

  1. Changes
    - Add storage policy for event_photos bucket to allow authenticated users to upload files
    - Update RLS policy on photos table to allow authenticated users to insert photos for their events
    - Add policy to allow users to upload photos for events they have access to via invitations

  2. Security
    - Ensures users can only upload photos to events they own or are invited to
    - Maintains existing read/update/delete policies
    - Adds proper storage bucket policies for file uploads
*/

-- First, enable RLS on the storage bucket if not already enabled
BEGIN;

-- Add storage policies for event_photos bucket
DO $$
BEGIN
  -- Delete existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  
  -- Create new policy for authenticated uploads
  CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      -- Allow upload if path starts with an event ID the user has access to
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE 
          -- User owns the event
          (e.user_id = auth.uid() AND bucket_id = 'event_photos' AND (storage.foldername(name))[1] = e.id::text)
          OR
          -- User is invited to the event
          EXISTS (
            SELECT 1 FROM public.invitations i
            WHERE i.event_id = e.id 
            AND i.guest_id IN (
              SELECT g.id FROM public.guests g
              WHERE g.email = auth.email()
            )
          )
      )
    );

  -- Add policy for reading photos
  CREATE POLICY "Allow public read" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'event_photos');
END $$;

-- Update photos table policies
DO $$
BEGIN
  -- Remove existing ALL policy if it exists
  DROP POLICY IF EXISTS "Users can CRUD photos for their events" ON public.photos;
  
  -- Create specific policies for each operation
  CREATE POLICY "Users can insert photos for their events" ON public.photos
    FOR INSERT
    TO authenticated
    WITH CHECK (
      -- Allow if user owns the event
      event_id IN (
        SELECT id FROM public.events
        WHERE user_id = auth.uid()
      )
      OR
      -- Allow if user is invited to the event
      event_id IN (
        SELECT i.event_id 
        FROM public.invitations i
        JOIN public.guests g ON i.guest_id = g.id
        WHERE g.email = auth.email()
      )
    );

  -- Keep existing select policy if needed
  CREATE POLICY "Users can view event photos" ON public.photos
    FOR SELECT
    TO authenticated
    USING (
      event_id IN (
        SELECT id FROM public.events
        WHERE user_id = auth.uid()
        OR privacy_setting = 'public'
      )
      OR
      event_id IN (
        SELECT i.event_id 
        FROM public.invitations i
        JOIN public.guests g ON i.guest_id = g.id
        WHERE g.email = auth.email()
      )
    );
END $$;

COMMIT;