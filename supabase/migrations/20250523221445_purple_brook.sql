/*
  # Add language support and translations

  1. New Tables
    - `languages`
      - `id` (text, primary key)
      - `name` (text)
      - `native_name` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
    - `translations`
      - `id` (uuid, primary key)
      - `language_id` (text, references languages)
      - `key` (text)
      - `value` (text)
      - `context` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
*/

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id text PRIMARY KEY,
  name text NOT NULL,
  native_name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id text REFERENCES languages(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  context text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint for language and key combination
ALTER TABLE translations
ADD CONSTRAINT translations_language_id_key_key UNIQUE (language_id, key);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_translations_language_key ON translations(language_id, key);

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

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