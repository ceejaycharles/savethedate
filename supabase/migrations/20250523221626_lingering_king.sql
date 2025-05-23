/*
  # Add Language Support and Photo Tags

  1. New Tables
    - `languages` - Stores supported languages
    - `translations` - Stores translation strings
    - `photo_tags` - Stores tags for photos

  2. Security
    - Enable RLS on all tables
    - Public read access for languages and translations
    - Authenticated users can manage photo tags for their events

  3. Data
    - Insert default languages including English and Nigerian languages
*/

-- Create languages table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS languages (
    id text PRIMARY KEY,
    name text NOT NULL,
    native_name text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create translations table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    language_id text REFERENCES languages(id) ON DELETE CASCADE,
    key text NOT NULL,
    value text NOT NULL,
    context text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create photo_tags table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS photo_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id uuid REFERENCES photos(id) ON DELETE CASCADE,
    tag text NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add unique constraint for translations if it doesn't exist
DO $$ BEGIN
  ALTER TABLE translations
  ADD CONSTRAINT translations_language_id_key_key UNIQUE (language_id, key);
EXCEPTION
  WHEN duplicate_constraint THEN NULL;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_translations_language_key ON translations(language_id, key);
  CREATE INDEX IF NOT EXISTS idx_photo_tags_photo_id ON photo_tags(photo_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read languages" ON languages;
DROP POLICY IF EXISTS "Anyone can read translations" ON translations;
DROP POLICY IF EXISTS "Users can manage photo tags for their photos" ON photo_tags;

-- Create policies
CREATE POLICY "Anyone can read languages"
  ON languages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read translations"
  ON translations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage photo tags for their photos"
  ON photo_tags
  FOR ALL
  TO authenticated
  USING (photo_id IN (
    SELECT id FROM photos
    WHERE event_id IN (
      SELECT id FROM events
      WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (photo_id IN (
    SELECT id FROM photos
    WHERE event_id IN (
      SELECT id FROM events
      WHERE user_id = auth.uid()
    )
  ));

-- Insert default languages
INSERT INTO languages (id, name, native_name)
VALUES 
  ('en', 'English', 'English'),
  ('fr', 'French', 'Français'),
  ('es', 'Spanish', 'Español'),
  ('yo', 'Yoruba', 'Yorùbá'),
  ('ha', 'Hausa', 'Hausa'),
  ('ig', 'Igbo', 'Igbo')
ON CONFLICT (id) DO NOTHING;