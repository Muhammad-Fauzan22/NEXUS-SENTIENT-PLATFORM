import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

/**
 * Supabase Admin Client dengan hak akses penuh
 *
 * ⚠️ KEAMANAN PENTING:
 * - Client ini hanya boleh digunakan di lingkungan server-side (+server.ts files)
 * - Jangan pernah mengimpor atau mengekspor client ini ke komponen frontend
 * - Service Role Key memberikan akses penuh tanpa memperhatikan RLS
 */
export const supabaseAdmin = createClient(
	env.SUPABASE_URL,
	env.SUPABASE_SERVICE_ROLE_KEY
);