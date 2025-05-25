/*
  # Add images column to gift_items table

  1. Changes
    - Add `images` column to `gift_items` table to store multiple image URLs
    - Set default value to empty array
    - Make column nullable
    - Update existing rows to have empty array if null

  2. Notes
    - Uses text[] type for storing array of image URLs
    - Default empty array prevents null issues
    - Safe migration that won't affect existing data
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'gift_items' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE gift_items 
    ADD COLUMN images text[] DEFAULT ARRAY[]::text[];

    -- Update existing rows to have empty array if null
    UPDATE gift_items 
    SET images = ARRAY[]::text[] 
    WHERE images IS NULL;
  END IF;
END $$;