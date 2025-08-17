import pkg from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

const { createClient } = pkg as any;
export const supabaseAdmin: SupabaseClient = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

