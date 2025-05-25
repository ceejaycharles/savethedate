/*
  # Event shares and system logs tables

  1. New Tables
    - `event_shares` - Track event sharing activity
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `platform` (text)
      - `shared_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `system_logs` - Admin monitoring and logging
      - `id` (uuid, primary key)
      - `level` (text)
      - `message` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policy for users to view their event shares
    - Add policy for admins to view system logs

  3. Indexes
    - Add indexes for efficient querying
*/

-- Create event shares table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS public.event_shares (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
      platform text NOT NULL,
      shared_at timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create system logs table for admin monitoring
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS public.system_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      level text NOT NULL,
      message text NOT NULL,
      metadata jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Add indexes if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_event_shares_event_id') THEN
    CREATE INDEX idx_event_shares_event_id ON public.event_shares(event_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_event_shares_platform') THEN
    CREATE INDEX idx_event_shares_platform ON public.event_shares(platform);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_system_logs_level') THEN
    CREATE INDEX idx_system_logs_level ON public.system_logs(level);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_system_logs_created_at') THEN
    CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.event_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their event shares" ON public.event_shares;
DROP POLICY IF EXISTS "Only admins can view system logs" ON public.system_logs;

-- Create policies
CREATE POLICY "Users can view their event shares" 
    ON public.event_shares
    FOR SELECT
    TO authenticated
    USING (event_id IN (
        SELECT id FROM public.events WHERE user_id = auth.uid()
    ));

CREATE POLICY "Only admins can view system logs" 
    ON public.system_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );