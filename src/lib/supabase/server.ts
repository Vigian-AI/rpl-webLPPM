import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Simple Supabase client for server-side (using Service Role Key to bypass RLS)
export async function createClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
