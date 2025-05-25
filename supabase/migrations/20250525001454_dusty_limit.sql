/*
  # Event Shares and System Logs Tables

  1. New Tables
    - `event_shares`
      - For tracking when and where events are shared
      - Includes event reference, platform, and timestamps
    - `system_logs` 
      - For admin monitoring and debugging
      - Stores log level, message, metadata, and timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for access control
      - Users can only view their own event shares
      - Only admins can access system logs

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create event shares table
CREATE TABLE IF NOT EXISTS public.event_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    platform text NOT NULL,
    shared_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create system logs table for admin monitoring
CREATE TABLE IF NOT EXISTS public.system_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    level text NOT NULL,
    message text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Add indexes (with IF NOT EXISTS to prevent duplicate index errors)
DO $$ 
BEGIN
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