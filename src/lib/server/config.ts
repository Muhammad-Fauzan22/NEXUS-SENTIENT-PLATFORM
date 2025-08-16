import dotenv from 'dotenv';

// Load environment variables from .env file at the very start
dotenv.config();

// Define an interface for type safety
interface EnvironmentVariables {
	VITE_PUBLIC_SUPABASE_URL: string;
	VITE_PUBLIC_SUPABASE_ANON_KEY: string;
	SUPABASE_URL: string;
	SUPABASE_SERVICE_ROLE_KEY: string;
	GOOGLE_CREDENTIALS_JSON: string;
	GDRIVE_FOLDER_ID: string;
	CLAUDE_API_KEY: string;
	GEMINI_API_KEY: string;
	PERPLEXITY_API_KEY: string;
	OPENAI_API_KEY: string;
	DEEPSEEK_API_KEYS: string;
	COHERE_API_KEYS: string;
	SMTP_HOST: string;
	SMTP_PORT: string;
	SMTP_USER: string;
	SMTP_PASS: string;
}

const config: Partial<EnvironmentVariables> = {
	VITE_PUBLIC_SUPABASE_URL: process.env.VITE_PUBLIC_SUPABASE_URL,
	VITE_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
	SUPABASE_URL: process.env.SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	GOOGLE_CREDENTIALS_JSON: process.env.GOOGLE_CREDENTIALS_JSON,
	GDRIVE_FOLDER_ID: process.env.GDRIVE_FOLDER_ID,
	CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
	GEMINI_API_KEY: process.env.GEMINI_API_KEY,
	PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	DEEPSEEK_API_KEYS: process.env.DEEPSEEK_API_KEYS,
	COHERE_API_KEYS: process.env.COHERE_API_KEYS,
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_USER: process.env.SMTP_USER,
	SMTP_PASS: process.env.SMTP_PASS
};

// --- Validation ---
// Always required for app to run
const requiredCore: Array<keyof EnvironmentVariables> = [
	'VITE_PUBLIC_SUPABASE_URL',
	'VITE_PUBLIC_SUPABASE_ANON_KEY',
	'SUPABASE_URL',
	'SUPABASE_SERVICE_ROLE_KEY'
];
for (const key of requiredCore) {
	if (!config[key]) throw new Error(`FATAL: Missing required environment variable: ${key}`);
}

// AI keys are conditional: either external providers or local LLM/embeddings must be present
const hasExternalAI = Boolean(
	config.CLAUDE_API_KEY || config.GEMINI_API_KEY || config.PERPLEXITY_API_KEY || config.OPENAI_API_KEY
);
const hasLocalAI = Boolean(process.env.LOCAL_LLM_BASE_URL || process.env.LOCAL_EMBEDDINGS_BASE_URL);
if (!hasExternalAI && !hasLocalAI) {
	throw new Error(
		'FATAL: No AI provider configured. Set one of external AI keys (CLAUDE/GEMINI/OPENAI/PERPLEXITY) or LOCAL_LLM_BASE_URL/LOCAL_EMBEDDINGS_BASE_URL.'
	);
}

// Optional configs (warn if missing)
const optionalKeys: Array<keyof EnvironmentVariables> = [
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
		// eslint-disable-next-line no-console
		console.warn(`[WARN] Optional env not set: ${key}`);
	}
}

// --- Freeze to prevent runtime mutations and assert type ---
export const env = Object.freeze(config as EnvironmentVariables);
