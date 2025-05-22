import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables would typically be loaded from .env file
// For this example, we're using placeholders
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);