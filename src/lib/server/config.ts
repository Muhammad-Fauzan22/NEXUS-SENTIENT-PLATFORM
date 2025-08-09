import { z } from 'zod';
import dotenv from 'dotenv';

// Muat variabel dari file .env ke dalam process.env
dotenv.config();

// Definisikan skema validasi untuk semua variabel lingkungan yang dibutuhkan
const configSchema = z.object({
	// Konfigurasi Supabase
	PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
	PUBLIC_SUPABASE_ANON_KEY: z.string().startsWith('ey').min(1, 'Supabase Anon Key is required'),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase Service Role Key is required'),

	// Konfigurasi Google API
	GOOGLE_CREDENTIALS_JSON: z.string().min(1, 'Google Credentials JSON is required'),

	// Konfigurasi API AI (contoh, tambahkan semua yang Anda gunakan)
	AZURE_OPENAI_KEY: z.string().min(1, 'Azure OpenAI Key is required'),
	GEMINI_API_KEY: z.string().min(1, 'Gemini API Key is required'),
	CLAUDE_API_KEY: z.string().min(1, 'Claude API Key is required'),
	// ...tambahkan kunci API lainnya di sini

	// Konfigurasi SMTP untuk pengiriman email
	SMTP_HOST: z.string().min(1, 'SMTP Host is required'),
	SMTP_PORT: z.coerce.number().int().positive('SMTP Port must be a positive integer'),
	SMTP_USER: z.string().min(1, 'SMTP User is required'),
	SMTP_PASS: z.string().min(1, 'SMTP Pass is required'),

	// Mode aplikasi
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

/**
 * Objek konfigurasi yang divalidasi dan aman secara tipe.
 * Jika ada variabel lingkungan yang hilang atau tidak valid,
 * aplikasi akan gagal saat startup dengan error yang jelas.
 */
export const config = configSchema.parse(process.env);