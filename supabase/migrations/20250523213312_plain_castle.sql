/*
  # Add Timeline and Task Management

  1. New Tables
    - `timelines`: For managing event milestones and schedules
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `title` (text)
      - `description` (text, optional)
      - `date` (timestamptz)
      - `order_index` (integer)
      
    - `tasks`: For managing event tasks and assignments
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `title` (text)
      - `description` (text, optional)
      - `due_date` (timestamptz)
      - `status` (text)
      - `assigned_to` (uuid, references users)
      - `priority` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Create necessary indexes
*/

-- Create timelines table
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

-- Create tasks table
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

-- Enable RLS
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage timelines for their events"
  ON timelines
  FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_timelines_event_id ON timelines(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_timelines
  BEFORE UPDATE ON timelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();