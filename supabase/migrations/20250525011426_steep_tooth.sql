/*
  # Add image support for meal options

  1. Changes
    - Add image_url and images columns to meal_options table
    - Create meal_photos storage bucket
    - Add storage policies for meal photos

  2. Security
    - Allow authenticated users to upload meal photos
    - Allow public access to view meal photos
*/

-- Add image columns to meal_options
ALTER TABLE meal_options 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[];

-- Create meal_photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal_photos', 'meal_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can upload meal photos" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view meal photos" ON storage.objects;
END $$;

-- Create policies for meal_photos bucket
CREATE POLICY "Authenticated users can upload meal photos"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'meal_photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view meal photos"
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'meal_photos');