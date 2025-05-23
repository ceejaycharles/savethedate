/*
  # Add theme support to events table

  1. Changes
    - Add theme_id column to events table
    - Set default theme to 'elegant'
*/

ALTER TABLE events
ADD COLUMN theme_id text DEFAULT 'elegant';