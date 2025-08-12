import dotenv from 'dotenv';

// Memuat variabel lingkungan dari file .env di root proyek.
dotenv.config();

/**
 * Objek konfigurasi yang divalidasi dan dibekukan (frozen).
 * Ini adalah satu-satunya sumber kebenaran (Single Source of Truth) untuk semua
 * variabel lingkungan di sisi server.
 *
 * Paradigma "Fail-Fast": Jika ada variabel penting yang hilang,
 * aplikasi akan crash saat startup, bukan saat runtime,
 * yang mencegah error yang tidak terduga di produksi.
 */
const config = {
	// --- Supabase (Publik: Aman untuk Browser) ---
	VITE_PUBLIC_SUPABASE_URL: process.env.VITE_PUBLIC_SUPABASE_URL,
	VITE_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_PUBLIC_SUPABASE_ANON_KEY,

	// --- Supabase (Privat: Hanya untuk Server) ---
	SUPABASE_URL: process.env.SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

	// --- Google Drive Connector ---
	GOOGLE_CREDENTIALS_JSON: process.env.GOOGLE_CREDENTIALS_JSON,
	GDRIVE_FOLDER_ID: process.env.GDRIVE_FOLDER_ID,

	// --- AI APIs ---
	CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
	GEMINI_API_KEY: process.env.GEMINI_API_KEY,
	PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	DEEPSEEK_API_KEYS: process.env.DEEPSEEK_API_KEYS,
	COHERE_API_KEYS: process.env.COHERE_API_KEYS,

	// --- Layanan Notifikasi (SMTP) ---
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_USER: process.env.SMTP_USER,
	SMTP_PASS: process.env.SMTP_PASS
};

// --- Validasi Kritis ---
const requiredKeys = [
	'VITE_PUBLIC_SUPABASE_URL',
	'VITE_PUBLIC_SUPABASE_ANON_KEY',
	'SUPABASE_URL',
	'SUPABASE_SERVICE_ROLE_KEY',
	'CLAUDE_API_KEY', // Kunci utama untuk analisis
	'GEMINI_API_KEY'  // Kunci utama untuk analisis
];

for (const key of requiredKeys) {
	if (!config[key]) {
		// Menghentikan proses secara paksa jika konfigurasi vital tidak ada.
		throw new Error(`FATAL: Missing required environment variable: ${key}. Server cannot start.`);
	}
}

// --- Immutability ---
// Membekukan objek untuk mencegah modifikasi yang tidak disengaja saat runtime.
export const env = Object.freeze(config);