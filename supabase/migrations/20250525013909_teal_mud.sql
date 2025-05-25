/*
  # Add photo upload and viewing policies

  1. Storage
    - Creates event_photos bucket if needed
    - Enables RLS on storage.objects
    - Adds policies for upload and viewing

  2. Photos Table
    - Adds policies for photo uploads
    - Adds policies for photo viewing
*/

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'event_photos'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('event_photos', 'event_photos');
  END IF;
END $$;

-- Enable RLS on storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Add storage bucket policy for uploads
CREATE POLICY "Users can upload photos to their events" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event_photos' AND
    split_part(name, '/', 1)::uuid IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

-- Add storage bucket policy for viewing
CREATE POLICY "Users can view photos from their events" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'event_photos' AND
    split_part(name, '/', 1)::uuid IN (
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