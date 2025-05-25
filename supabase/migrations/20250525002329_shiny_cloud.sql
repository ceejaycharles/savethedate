/*
  # Create timelines and tasks tables

  1. New Tables
    - timelines
      - id (uuid, primary key)
      - event_id (uuid, references events)
      - title (text)
      - description (text, optional)
      - date (timestamptz)
      - order_index (integer)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - tasks
      - id (uuid, primary key)
      - event_id (uuid, references events)
      - title (text)
      - description (text, optional)
      - due_date (timestamptz, optional)
      - status (text, default: 'pending')
      - assigned_to (uuid, references users)
      - priority (text, default: 'medium')
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own event data
    
  3. Performance
    - Add indexes for foreign keys and commonly queried columns
*/

-- Create timelines table if it doesn't exist
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

-- Create tasks table if it doesn't exist
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
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage timelines for their events" ON timelines;
  DROP POLICY IF EXISTS "Users can manage tasks for their events" ON tasks;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

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

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_timelines_event_id ON timelines(event_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add triggers for updated_at if they don't exist
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_timelines
    BEFORE UPDATE ON timelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;