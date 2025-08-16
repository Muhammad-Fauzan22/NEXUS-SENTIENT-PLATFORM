import { logger } from '$lib/server/utils/logger';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function withRetry<T>(fn: () => Promise<T>, attempts = 3) {
	let lastErr: any;
	for (let i = 0; i < attempts; i++) {
		try {
			return await fn();
		} catch (e) {
			lastErr = e;
			await sleep(250 * (i + 1));
		}
	}
	throw lastErr;
}


// Embedding provider that targets an OpenAI-compatible /v1/embeddings endpoint.
// Works both in SvelteKit server and in Node scripts (uses process.env).
const EMB_BASE = process.env.LOCAL_EMBEDDINGS_BASE_URL || process.env.LOCAL_LLM_BASE_URL; // allow reuse
const EMB_MODEL = process.env.LOCAL_EMBEDDINGS_MODEL || 'text-embedding-3-small';
const EMB_API_KEY = process.env.LOCAL_EMBEDDINGS_API_KEY || process.env.LOCAL_LLM_API_KEY;

export async function generateEmbedding(text: string): Promise<number[]> {
	if (!EMB_BASE) {
		logger.warn('LOCAL_EMBEDDINGS_BASE_URL is not set. Falling back to random embedding.');
		return Array(1536).fill(0).map(Math.random);
	}
	try {
		const res = await withRetry(() =>
			fetch(`${EMB_BASE.replace(/\/$/, '')}/embeddings`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(EMB_API_KEY ? { Authorization: `Bearer ${EMB_API_KEY}` } : {})
				},
				body: JSON.stringify({ input: text, model: EMB_MODEL })
			})
		);
		if (!res.ok) {
			const body = await res.text();
			logger.error('Embedding API call failed', { status: res.status, body });
			return Array(1536).fill(0).map(Math.random);
		}
		const data = await res.json();
		const vec = data?.data?.[0]?.embedding;
		if (!Array.isArray(vec)) {
			logger.warn('Embedding API returned invalid format. Using random vector.');
			return Array(1536).fill(0).map(Math.random);
		}
		return vec as number[];
	} catch (error) {
		logger.error('Embedding provider error. Using random vector.', { error });
		return Array(1536).fill(0).map(Math.random);
	}
}

export const embeddingProvider = { generateEmbedding };

