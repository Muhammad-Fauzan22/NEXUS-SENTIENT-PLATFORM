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
const requiredKeys: Array<keyof EnvironmentVariables> = [
	'VITE_PUBLIC_SUPABASE_URL',
	'VITE_PUBLIC_SUPABASE_ANON_KEY',
	'SUPABASE_URL',
	'SUPABASE_SERVICE_ROLE_KEY',
	'GOOGLE_CREDENTIALS_JSON',
	'GDRIVE_FOLDER_ID',
	'CLAUDE_API_KEY',
	'GEMINI_API_KEY',
	'PERPLEXITY_API_KEY',
	'OPENAI_API_KEY',
	'DEEPSEEK_API_KEYS',
	'COHERE_API_KEYS',
	'SMTP_HOST',
	'SMTP_PORT',
	'SMTP_USER',
	'SMTP_PASS'
];

for (const key of requiredKeys) {
	if (!config[key]) {
		throw new Error(`FATAL: Missing required environment variable: ${key}`);
	}
}

// --- Freeze to prevent runtime mutations and assert type ---
export const env = Object.freeze(config as EnvironmentVariables);
type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogContext = Record<string, unknown>;

/**
 * The core logging function. Avoid using this directly.
 * @param level The severity level of the log.
 * @param message The main log message.
 * @param context Optional additional data to include in the log.
 */
function log(level: LogLevel, message: string, context: LogContext = {}): void {
	const logObject = {
		timestamp: new Date().toISOString(),
		level,
		message,
		...context
	};

	const logString = JSON.stringify(logObject);

	switch (level) {
		case 'INFO':
			console.info(logString);
			break;
		case 'WARN':
			console.warn(logString);
			break;
		case 'ERROR':
			console.error(logString);
			break;
	}
}

/**
 * Logs an informational message. Use for general application flow events.
 * @param message The main log message.
 * @param context Optional additional data.
 */
export function info(message: string, context?: LogContext): void {
	log('INFO', message, context);
}

/**
 * Logs a warning message. Use for non-critical issues that should be investigated.
 * @param message The main log message.
 * @param context Optional additional data.
 */
export function warn(message: string, context?: LogContext): void {
	log('WARN', message, context);
}

/**
 * Logs an error message. Use for critical failures, exceptions, and unexpected states.
 * @param message The main log message.
 * @param context Optional additional data, often including an error object.
 */
export function error(message: string, context?: LogContext): void {
	log('ERROR', message, context);
}

export const logger = {
	info,
	warn,
	error
};