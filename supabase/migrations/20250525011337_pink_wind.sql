/*
  # Add image support for meal options

  1. Changes
    - Add image_url column to meal_options table
    - Add images array column to meal_options table for multiple photos
  
  2. Notes
    - image_url stores the primary/cover image URL
    - images stores an array of all image URLs including the cover
*/

-- Add image columns to meal_options
ALTER TABLE meal_options 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[];

-- Create meal_photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal_photos', 'meal_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for meal_photos bucket if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Authenticated users can upload meal photos'
        AND table_name = 'objects'
    ) THEN
        CREATE POLICY "Authenticated users can upload meal photos"
        ON storage.objects FOR INSERT TO authenticated WITH CHECK (
            bucket_id = 'meal_photos' AND
            (storage.foldername(name))[1] IN (
                SELECT id::text FROM events WHERE user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Anyone can view meal photos'
        AND table_name = 'objects'
    ) THEN
        CREATE POLICY "Anyone can view meal photos"
        ON storage.objects FOR SELECT TO public 
        USING (bucket_id = 'meal_photos');
    END IF;
END $$;