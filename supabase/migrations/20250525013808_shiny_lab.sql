/*
  # Add photo upload policies

  1. Changes
    - Add storage bucket policy for event_photos
    - Add RLS policy for photos table to allow uploads
    - Add policy for viewing photos

  2. Security
    - Enable RLS on storage bucket
    - Add policies to allow authenticated users to upload photos for their events
    - Allow users to view photos for events they have access to
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
    (REGEXP_MATCH(name, '^([^/]+)/')[1])::uuid IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

-- Add storage bucket policy for viewing
CREATE POLICY "Users can view photos from their events" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'event_photos' AND
    (REGEXP_MATCH(name, '^([^/]+)/')[1])::uuid IN (
      SELECT e.id 
      FROM public.events e
      WHERE e.user_id = auth.uid()
      UNION
      SELECT i.event_id
      FROM public.invitations i
      JOIN public.guests g ON i.guest_id = g.id
      WHERE g.email = auth.jwt() ->> 'email'
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
      WHERE g.email = auth.jwt() ->> 'email'
    )
  );