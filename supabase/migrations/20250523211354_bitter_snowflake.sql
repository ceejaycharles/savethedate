/*
  # Add theme customization support

  1. Changes
    - Add theme_colors column to events table to store custom color schemes
    - Add theme_id column to events table to store the base theme template

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE events
ADD COLUMN IF NOT EXISTS theme_colors jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS theme_id text DEFAULT 'elegant'::text;