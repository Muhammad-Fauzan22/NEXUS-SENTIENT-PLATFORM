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
// Wajib
const requiredCore = [
	'VITE_PUBLIC_SUPABASE_URL',
	'VITE_PUBLIC_SUPABASE_ANON_KEY',
	'SUPABASE_URL',
	'SUPABASE_SERVICE_ROLE_KEY'
];
for (const key of requiredCore) {
	if (!config[key]) {
		throw new Error(`FATAL: Missing required environment variable: ${key}. Server cannot start.`);
	}
}

// Opsi AI: minimal salah satu tersedia (eksternal atau lokal)
const hasExternalAI = Boolean(
	config.CLAUDE_API_KEY ||
		config.GEMINI_API_KEY ||
		config.PERPLEXITY_API_KEY ||
		config.OPENAI_API_KEY
);
const hasLocalAI = Boolean(process.env.LOCAL_LLM_BASE_URL || process.env.LOCAL_EMBEDDINGS_BASE_URL);
if (!hasExternalAI && !hasLocalAI) {
	console.warn(
		"[WARN] No AI provider configured. Provide external AI keys or set LOCAL_LLM_BASE_URL/LOCAL_EMBEDDINGS_BASE_URL. Running in 'AI-lite' mode."
	);
}

// Opsional (peringatan saja)
const optionalKeys = [
	'GOOGLE_CREDENTIALS_JSON',
	'GDRIVE_FOLDER_ID',
	'DEEPSEEK_API_KEYS',
	'COHERE_API_KEYS',
	'SMTP_HOST',
	'SMTP_PORT',
	'SMTP_USER',
	'SMTP_PASS'
];
for (const key of optionalKeys) {
	if (!config[key]) {
		console.warn(`[WARN] Optional env not set: ${key}`);
	}
}

// --- Immutability ---
export const env = Object.freeze(config);
