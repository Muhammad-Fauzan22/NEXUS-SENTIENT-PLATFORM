import { logger } from '$lib/server/utils/logger';
// NOTE: add timeout & retry wrapper
const withTimeout = async <T>(p: Promise<T>, ms = 20_000) => {
	return await Promise.race([
		p,
		new Promise<T>((_, rej) => setTimeout(() => rej(new Error('AI request timeout')), ms))
	]);
};

import { InternalServerError } from '$lib/server/utils/errors';
import { env as dynamicEnv } from '$env/dynamic/private';

import { CircuitBreaker } from '$lib/server/utils/circuitBreaker';
const llmBreaker = new CircuitBreaker(4, 30_000, 10_000);

/**
 * Local LLM provider (self-hosted) with flexible API compatibility.
 * Supported modes via env LOCAL_LLM_MODE:
 *  - 'openai'   -> OpenAI-compatible Chat Completions API
 *  - 'llamacpp' -> llama.cpp server /completion endpoint
 *  - 'ollama'   -> Ollama's OpenAI-compatible /v1/chat/completions
 *
 * Required env vars (depending on mode):
 *  - LOCAL_LLM_BASE_URL (e.g., http://127.0.0.1:11434 or http://localhost:8000/v1)
 *  - LOCAL_LLM_MODEL (model name or path understood by the server)
 *  - Optional: LOCAL_LLM_API_KEY (if your gateway enforces auth)
 */

const BASE_URL = dynamicEnv.LOCAL_LLM_BASE_URL;
const MODEL = dynamicEnv.LOCAL_LLM_MODEL || 'qwen2.5:1.5b-instruct-q4_K_M';
const API_KEY = dynamicEnv.LOCAL_LLM_API_KEY;
const MODE = (dynamicEnv.LOCAL_LLM_MODE || 'openai').toLowerCase();

function assertConfigured() {
	if (!BASE_URL) {
		throw new InternalServerError('LOCAL_LLM_BASE_URL is not set. Please configure your local LLM endpoint.');
	}
}

export async function generate(prompt: string): Promise<string> {
	try {
		assertConfigured();
		if (!llmBreaker.canProceed()) {
			throw new InternalServerError('LLM circuit breaker is OPEN. Please try again later.');
		}


		if (MODE === 'llamacpp') {
			// llama.cpp server: POST /completion with timeout
			const res = await withTimeout(
				fetch(`${BASE_URL.replace(/\/$/, '')}/completion`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prompt, stream: false, temperature: 0.7, mirostat: 0, stop: ['</s>'] })
				}),
				20_000
			);
			if (!res.ok) {
				const text = await res.text();
				logger.error('Local LLM (llama.cpp) call failed', { status: res.status, text });
				llmBreaker.fail();
				throw new InternalServerError('Local LLM (llama.cpp) request failed.');
			}
			llmBreaker.succeed();
			const data = await res.json();
			const out = (data?.content || data?.completion || '').toString().trim();
			return out;
		}

		// Default: OpenAI-compatible Chat Completions (OpenWebUI, Ollama, vLLM, llama-cpp-oai)
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;
		const res = await withTimeout(
			fetch(`${BASE_URL.replace(/\/$/, '')}/chat/completions`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					model: MODEL,
					messages: [
						{ role: 'system', content: 'You are NEXUS, a helpful academic and career mentor.' },
						{ role: 'user', content: prompt }
					],
					stream: false,
					temperature: 0.7
				})
			}),
			20_000
		);
		if (!res.ok) {
			const text = await res.text();
			logger.error('Local LLM (OpenAI-compatible) call failed', { status: res.status, text });
			llmBreaker.fail();
			throw new InternalServerError('Local LLM (OpenAI-compatible) request failed.');
		}
		llmBreaker.succeed();
		const data = await res.json();
		const out = (data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '').toString().trim();
		return out;
	} catch (error) {
		logger.error('Local LLM provider encountered an unexpected error', { error });
		throw error instanceof InternalServerError ? error : new InternalServerError('Local LLM provider failed.');
	}
}

export const localProvider = { generate };

