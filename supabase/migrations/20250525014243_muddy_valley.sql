/*
  # Photo Storage and Access Policies

  1. Storage Setup
    - Create event_photos bucket if it doesn't exist
    - Configure storage policies for uploads and viewing

  2. Photo Table Policies
    - Add policy for photo uploads by event owners
    - Add policy for viewing photos by event owners and guests
*/

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'event_photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('event_photos', 'event_photos', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can upload photos to events they own" ON public.photos;
  DROP POLICY IF EXISTS "Users can view photos from their events" ON public.photos;
END $$;

-- Add policy for inserting photos
CREATE POLICY "Users can upload photos to events they own" ON public.photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

-- Add policy for viewing photos
CREATE POLICY "Users can view photos from their events" ON public.photos
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id 
      FROM public.events e
      WHERE e.user_id = auth.uid()
      UNION
      SELECT i.event_id
      FROM public.invitations i
      JOIN public.guests g ON i.guest_id = g.id
      WHERE g.email = auth.email()
    )
  );

-- Enable RLS on photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;