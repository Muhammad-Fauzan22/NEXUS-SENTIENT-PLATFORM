import { createClient } from '@supabase/supabase-js';
import { env } from '$lib/server/config';

// Note: We are using the server-side config module here, but only accessing the
// VITE_PUBLIC_ keys which are safe to expose to the browser.
// This maintains a single source of truth for configuration.

const supabaseUrl = env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.VITE_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The singleton, typed Supabase client instance.
 * This is safe to use in both server-side and client-side code.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);