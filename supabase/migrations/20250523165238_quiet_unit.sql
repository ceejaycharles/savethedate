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
CREATE INDEX idx_event_shares_event_id ON public.event_shares(event_id);
CREATE INDEX idx_event_shares_platform ON public.event_shares(platform);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);

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