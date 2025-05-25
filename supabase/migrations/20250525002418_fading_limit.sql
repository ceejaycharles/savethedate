/*
  # Timelines and tasks tables

  1. New Tables
    - `timelines` - Event timeline entries
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `title` (text)
      - `description` (text)
      - `date` (timestamptz)
      - `order_index` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tasks` - Event tasks and assignments
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamptz)
      - `status` (text)
      - `assigned_to` (uuid, references users)
      - `priority` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their event data

  3. Indexes and Triggers
    - Add indexes for efficient querying
    - Add updated_at triggers
*/

-- Create timelines table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS timelines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    date timestamptz NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create tasks table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES events(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    due_date timestamptz,
    status text DEFAULT 'pending',
    assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
    priority text DEFAULT 'medium',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage timelines for their events" ON timelines;
DROP POLICY IF EXISTS "Users can manage tasks for their events" ON tasks;

-- Create policies
CREATE POLICY "Users can manage timelines for their events"
  ON timelines
  FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage tasks for their events"
  ON tasks
  FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Add indexes if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_timelines_event_id') THEN
    CREATE INDEX idx_timelines_event_id ON timelines(event_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_event_id') THEN
    CREATE INDEX idx_tasks_event_id ON tasks(event_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_assigned_to') THEN
    CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
  END IF;
END $$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_updated_at_timelines ON timelines;
DROP TRIGGER IF EXISTS set_updated_at_tasks ON tasks;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_timelines
  BEFORE UPDATE ON timelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();