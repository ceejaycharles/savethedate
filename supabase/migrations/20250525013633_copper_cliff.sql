/*
  # Fix photo upload permissions

  1. Changes
    - Drop existing photo-related policies
    - Add new storage policies for event_photos bucket
    - Add comprehensive RLS policies for photos table
  
  2. Security
    - Enable proper access control for photo uploads
    - Allow event owners and invited guests to upload photos
    - Maintain proper visibility based on event privacy settings
*/

-- First, enable RLS on the storage bucket if not already enabled
BEGIN;

-- Add storage policies for event_photos bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event_photos' AND (
      -- Allow upload if path starts with an event ID the user has access to
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE 
          -- User owns the event
          (e.user_id = auth.uid() AND (storage.foldername(name))[1] = e.id::text)
          OR
          -- User is invited to the event
          EXISTS (
            SELECT 1 FROM public.invitations i
            JOIN public.guests g ON i.guest_id = g.id
            WHERE i.event_id = e.id AND g.email = auth.email()
          )
      )
    )
  );

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'event_photos');

-- Update photos table policies
DROP POLICY IF EXISTS "Event owners can manage photos" ON public.photos;
DROP POLICY IF EXISTS "Users can view event photos" ON public.photos;
DROP POLICY IF EXISTS "Guests can upload photos" ON public.photos;

-- Policy for event owners
CREATE POLICY "Event owners can manage photos" ON public.photos
  FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM public.events
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events
      WHERE user_id = auth.uid()
    )
  );

-- Policy for viewing photos
CREATE POLICY "Users can view event photos" ON public.photos
  FOR SELECT
  TO public
  USING (
    -- Public events are visible to everyone
    event_id IN (
      SELECT id FROM public.events
      WHERE privacy_setting = 'public'
    )
    OR
    -- Invited guests can view photos
    event_id IN (
      SELECT i.event_id 
      FROM public.invitations i
      JOIN public.guests g ON i.guest_id = g.id
      WHERE g.email = auth.email()
    )
  );

-- Policy for guests uploading photos
CREATE POLICY "Guests can upload photos" ON public.photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    event_id IN (
      SELECT i.event_id 
      FROM public.invitations i
      JOIN public.guests g ON i.guest_id = g.id
      WHERE g.email = auth.email()
    )
  );

COMMIT;