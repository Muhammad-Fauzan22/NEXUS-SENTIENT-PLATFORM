import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

/**
 * Supabase Admin Client dengan hak akses penuh
 * 
 * ⚠️ KEAMANAN PENTING:
 * - Client ini hanya boleh digunakan di lingkungan server-side (+server.ts files)
 * - Jangan pernah mengimpor atau mengekspor client ini ke komponen frontend
 * - Service Role Key memberikan akses penuh tanpa memperhatikan RLS
 */
export const supabaseAdmin = createClient(
	PUBLIC_SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY
);