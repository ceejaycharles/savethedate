-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('event_photos', 'Event Photos', true),
  ('event_covers', 'Event Cover Images', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload event photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload event covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event photos" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload event photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'event_photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload event covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'event_covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view event photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('event_photos', 'event_covers'));