import { createClient } from '@supabase/supabase-js';

// Load from Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
