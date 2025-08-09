// src/lib/server/db/supabase.admin.ts
// Koneksi Supabase untuk sisi SERVER (Backend) dengan hak akses penuh (Service Role).
// Digunakan untuk operasi sensitif seperti manajemen data, akses penuh ke semua tabel,
// dan fungsi backend. JANGAN PERNAH EKSPOR CLIENT INI KE KODE CLIENT-SIDE (BROWSER).

// @ts-ignore
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import type { SupabaseClient } from '@supabase/supabase-js';
// @ts-ignore
import logger from '$lib/server/utils/logger';

// --- 1. Ambil kredensial dari environment variables (HANYA UNTUK SERVER) ---
// Variabel lingkungan yang TIDAK diawali dengan VITE_PUBLIC_ hanya tersedia di server.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- 2. Validasi kredensial ---
if (!supabaseUrl || !supabaseServiceKey) {
	const missingEnv = [];
	if (!supabaseUrl) missingEnv.push('SUPABASE_URL');
	if (!supabaseServiceKey) missingEnv.push('SUPABASE_SERVICE_ROLE_KEY');

	const errorMsg = `[Supabase Admin] Missing required environment variables: ${missingEnv.join(', ')}`;
	// @ts-ignore
	logger.error(errorMsg);
	console.error(errorMsg); // Log tambahan ke console untuk visibilitas awal
	throw new Error(errorMsg);
}

// --- 3. Buat instance client Supabase dengan hak akses penuh (Service Role) ---
// Instance ini digunakan untuk operasi server-side seperti:
// - Menyimpan data mentah asesmen (raw_assessment_data)
// - Memproses dan menyimpan profil (processed_profiles)
// - Menghasilkan dan menyimpan draft IDP (idp_records)
// - Mengambil chunk pengetahuan untuk RAG (knowledge_chunks)
// - Manajemen pengguna (jika diperlukan)
// - Akses penuh ke semua tabel tanpa batasan RLS (Row Level Security)

// @ts-ignore
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		// Gunakan service key untuk bypass auth dan mendapatkan akses penuh.
		// Ini penting untuk operasi backend yang tidak melibatkan pengguna spesifik.
		autoRefreshToken: false, // Tidak perlu refresh token untuk service role
		persistSession: false, // Tidak perlu menyimpan session untuk service role
		detectSessionInUrl: false // Tidak perlu mendeteksi session dari URL
	},
	// Tambahkan opsi lain jika diperlukan, seperti:
	// db: { schema: 'public' }, // Jika menggunakan schema khusus
	// global: { headers: { 'X-Client-Info': 'NEXUS-Sentient-Platform' } } // Header kustom
});

// @ts-ignore
logger.info('[Supabase Admin] Initialized with service role privileges.');

// --- 4. Contoh Penggunaan (untuk dokumentasi internal) ---
// import { supabaseAdmin } from '$lib/server/db/supabase.admin';
//
// // Simpan data mentah
// const { data, error } = await supabaseAdmin.from('raw_assessment_data').insert([{ ... }]);
//
// // Ambil chunk pengetahuan untuk RAG
// const { data: chunks, error: dbError } = await supabaseAdmin.rpc('match_knowledge_chunks', { ... });
//
// // Simpan draft IDP
// const { data: idpRecord, error: saveError } = await supabaseAdmin.from('idp_records').insert([{ ... }]);