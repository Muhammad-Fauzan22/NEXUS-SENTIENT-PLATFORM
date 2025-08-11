import type { AIProvider } from './baseProvider';
import { config } from '$lib/server/config';
import { InternalServerError } from '$lib/server/utils/errors';
import { logger } from '$lib/server/utils/logger';
import type { GeneratedIDP } from '$lib/types/schemas';

// Implementasi spesifik untuk Azure OpenAI
class AzureProvider implements AIProvider {
	private apiKey: string;
	private apiEndpoint: string;
    private embeddingEndpoint: string;

	constructor() {
		if (!config.AZURE_OPENAI_KEY) {
			throw new InternalServerError('Konfigurasi untuk Azure OpenAI tidak ditemukan.');
		}
		this.apiKey = config.AZURE_OPENAI_KEY;
		// TODO: Ganti URL endpoint ini dengan URL spesifik Azure Anda
		this.apiEndpoint = 'https://YOUR_AZURE_ENDPOINT.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/chat/completions?api-version=2023-07-01-preview';
        this.embeddingEndpoint = 'https://YOUR_AZURE_ENDPOINT.openai.azure.com/openai/deployments/YOUR_EMBEDDING_DEPLOYMENT_NAME/embeddings?api-version=2023-07-01-preview';
	}

	async generateStructuredContent(prompt: string): Promise<GeneratedIDP> {
		logger.debug('Memanggil Azure OpenAI untuk generasi konten...');
		const response = await fetch(this.apiEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': this.apiKey
			},
			body: JSON.stringify({
				messages: [
					{ role: 'system', content: 'Anda adalah asisten AI yang menghasilkan output JSON yang valid.' },
					{ role: 'user', content: prompt }
				],
				response_format: { type: 'json_object' }, // Memaksa output JSON
				temperature: 0.4,
                max_tokens: 4096,
			})
		});

		if (!response.ok) {
			const errorBody = await response.text();
			logger.error({ status: response.status, body: errorBody }, 'Gagal memanggil Azure OpenAI API.');
			throw new InternalServerError('Gagal berkomunikasi dengan layanan AI.');
		}

		const result = await response.json();
		const content = result.choices[0]?.message?.content;

		if (!content) {
			throw new InternalServerError('Respons dari AI kosong atau tidak valid.');
		}

		try {
			// Parsing dan validasi output JSON dari AI
			return JSON.parse(content) as GeneratedIDP;
		} catch (e) {
			logger.error({ error: e, content }, 'Gagal mem-parsing JSON dari respons AI.');
			throw new InternalServerError('Gagal memproses respons dari layanan AI.');
		}
	}

	async generateEmbedding(text: string): Promise<number[]> {
		logger.debug('Memanggil Azure OpenAI untuk generasi embedding...');
        const response = await fetch(this.embeddingEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': this.apiKey
			},
			body: JSON.stringify({
				input: text
			})
		});

        if (!response.ok) {
            const errorBody = await response.text();
			logger.error({ status: response.status, body: errorBody }, 'Gagal memanggil Azure OpenAI Embedding API.');
			throw new InternalServerError('Gagal membuat embedding.');
        }

        const result = await response.json();
        const embedding = result.data[0]?.embedding;

        if (!embedding || !Array.isArray(embedding)) {
            throw new InternalServerError('Respons embedding dari AI tidak valid.');
        }

		return embedding;
	}
}

// Ekspor satu instance dari provider (Singleton Pattern)
export const azureProvider = new AzureProvider();
