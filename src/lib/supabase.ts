import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZnluZnl1aHpyanN6cmZlb29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkzOTI3NiwiZXhwIjoyMDYzNTE1Mjc2fQ.8N_xuX6S7OTNy5jSSz-u1WjuzcHgHuu5mmrYyNHFFF8';

// Create regular client for normal operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create admin client with service role key for admin operations
export const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);