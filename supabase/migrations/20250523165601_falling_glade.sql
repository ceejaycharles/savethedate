/*
  # Add admin role and social sharing features

  1. Changes
    - Add role column to users table
    - Create event_shares table for social sharing tracking
    - Create system_logs table for admin monitoring
    - Add appropriate indexes and policies
  
  2. Security
    - Enable RLS on new tables
    - Add policies for event shares and system logs
*/

-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_event_shares_event_id ON public.event_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_platform ON public.event_shares(platform);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.event_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

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

-- Insert initial admin user if not exists
INSERT INTO public.users (id, email, role)
SELECT auth.uid(), auth.email(), 'admin'
FROM auth.users
WHERE auth.email() = 'admin@savethedate.ng'
ON CONFLICT (id) DO UPDATE SET role = 'admin';