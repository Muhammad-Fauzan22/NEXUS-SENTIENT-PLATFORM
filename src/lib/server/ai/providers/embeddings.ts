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

import { CircuitBreaker } from '$lib/server/utils/circuitBreaker';
const embBreaker = new CircuitBreaker(5, 30_000, 10_000);

// Embedding provider that targets an OpenAI-compatible /v1/embeddings endpoint.
// Works both in SvelteKit server and in Node scripts (uses process.env).
const EMB_BASE = process.env.LOCAL_EMBEDDINGS_BASE_URL || process.env.LOCAL_LLM_BASE_URL; // allow reuse
const EMB_MODEL = process.env.LOCAL_EMBEDDINGS_MODEL || 'nomic-embed-text'; // better local default (768-d)
const EMB_API_KEY = process.env.LOCAL_EMBEDDINGS_API_KEY || process.env.LOCAL_LLM_API_KEY;
const TARGET_DIM = Number(process.env.EMBEDDINGS_TARGET_DIM || 1536); // DB pgvector dim

function normalize(vec: number[], target = TARGET_DIM): number[] {
	if (vec.length === target) return vec;
	if (vec.length > target) return vec.slice(0, target);
	// pad with zeros
	return vec.concat(Array(target - vec.length).fill(0));
}

function randomVec(dim = TARGET_DIM) {
	return Array(dim).fill(0).map(Math.random);
}

export async function generateEmbedding(text: string): Promise<number[]> {
	if (!EMB_BASE) {
		logger.warn('LOCAL_EMBEDDINGS_BASE_URL is not set. Falling back to random embedding.');
		return randomVec();
	}
	if (!embBreaker.canProceed()) {
		logger.error('Embedding circuit breaker is OPEN. Using random vector.');
		return randomVec();
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
			embBreaker.fail();
			return randomVec();
		}
		embBreaker.succeed();
		const data = await res.json();
		const vec = data?.data?.[0]?.embedding;
		if (!Array.isArray(vec)) {
			logger.warn('Embedding API returned invalid format. Using random vector.');
			return randomVec();
		}
		return normalize(vec as number[]);
	} catch (error) {
		logger.error('Embedding provider error. Using random vector.', { error });
		return randomVec();
	}
}

export const embeddingProvider = { generateEmbedding };
