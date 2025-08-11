import { createClient } from '@supabase/supabase-js';
import { config } from '$lib/server/config';
import type { Database } from '$lib/types/database.types';

// Periksa apakah kita berada di lingkungan server.
// Ini adalah pengaman untuk mencegah client ini secara tidak sengaja
// diimpor atau dieksekusi di lingkungan browser.
if (typeof window !== 'undefined') {
	throw new Error('Supabase Admin Client tidak boleh diimpor di sisi klien.');
}

/**
 * Instance Supabase client dengan hak akses 'service_role'.
 * Client ini memiliki hak akses penuh ke database Anda dan mengabaikan
 * semua kebijakan Row Level Security (RLS).
 *
 * PENTING: Gunakan HANYA di lingkungan server yang aman (misalnya, di dalam
 * SvelteKit +server.js endpoints atau server-side services).
 * JANGAN PERNAH mengekspos service_role_key ke sisi klien.
 *
 * Kita menggunakan tipe 'Database' yang digenerate dari skema Supabase
 * untuk mendapatkan type-safety dan autocomplete pada semua query.
 */
export const supabaseAdmin = createClient<Database>(
	config.PUBLIC_SUPABASE_URL,
	config.SUPABASE_SERVICE_ROLE_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	}
);