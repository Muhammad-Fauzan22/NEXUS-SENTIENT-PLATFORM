import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '$lib/server/config';

// Client ini menggunakan SERVICE_ROLE_KEY dan HANYA boleh digunakan di sisi server.
// Client ini melewati semua kebijakan Row Level Security (RLS).

const supabaseUrl: string = env.SUPABASE_URL as string;
const supabaseServiceKey: string = env.SUPABASE_SERVICE_ROLE_KEY as string;

/**
 * Instance singleton dari Supabase admin client yang telah diketik.
 *
 * PERINGATAN: Client ini memiliki hak akses penuh ke database Anda dan
 * mengabaikan semua kebijakan RLS. Gunakan dengan sangat hati-hati dan
 * hanya di lingkungan server yang tepercaya.
 *
 * Opsi `persistSession` dan `autoRefreshToken` dinonaktifkan karena
 * tidak relevan untuk operasi server-to-server yang stateless.
 */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
});