import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '$lib/server/config';

// This client uses the SERVICE_ROLE_KEY and should ONLY be used on the server.
// It bypasses all Row Level Security (RLS) policies.

const supabaseUrl: string = env.SUPABASE_URL;
const supabaseServiceKey: string = env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * The singleton, typed Supabase admin client instance.
 * WARNING: This client bypasses all RLS policies.
 * Use with caution and only in trusted server-side environments.
 */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
});