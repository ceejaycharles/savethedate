/*
  # Add plus one support for guests

  1. Changes
    - Add plus one columns to guests table
    - Add indexes for efficient querying
*/

-- Add plus one columns to guests table
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS plus_one_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS plus_one_name text,
ADD COLUMN IF NOT EXISTS plus_one_email text;