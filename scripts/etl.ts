import dotenv from 'dotenv';
import { supabaseAdmin } from '../src/lib/server/db/supabase.admin';
import { logger } from '../src/lib/server/utils/logger';
import type { PostgrestError } from '@supabase/supabase-js';

// Load environment variables from the root .env file
dotenv.config({ path: './.env' });

// Define the structure of our knowledge chunks
interface KnowledgeChunk {
	id: number;
	source_id: string;
	content: string;
	content_embedding: number[];
	metadata: Record<string, unknown>;
}

// Placeholder for a function that would generate embeddings
async function getEmbedding(text: string): Promise<number[]> {
	// In a real implementation, this would call an AI embedding model (e.g., OpenAI, Cohere)
	logger.debug('Generating embedding for chunk...', { length: text.length });
	// Returning a dummy array of the correct dimension for Supabase pgvector
	return Array(1536).fill(0).map(Math.random);
}

async function processAndLoadChunks(chunks: Omit<KnowledgeChunk, 'content_embedding' | 'id'>[]) {
	logger.info(`Processing ${chunks.length} chunks to generate embeddings...`);

	for (const chunk of chunks) {
		try {
			const embedding = await getEmbedding(chunk.content);
			const chunkWithEmbedding = {
				...chunk,
				content_embedding: embedding
			};

			const { error } = await supabaseAdmin.from('knowledge_chunks').insert(chunkWithEmbedding);

			if (error) {
				// CORRECTED: Pass a string message and the error object in the context
				logger.error('Failed to insert chunk into Supabase.', { error });
			} else {
				logger.info(`Successfully inserted chunk for source: ${chunk.source_id}`);
			}
		} catch (err) {
			// CORRECTED: Pass a string message and the error object in the context
			logger.error('An error occurred during embedding or insertion.', { error: err, chunk });
		}
	}
}

async function main() {
	logger.info('Starting ETL process...');

	// --- EXTRACT ---
	// In a real-world scenario, you would extract data from a source like Google Drive.
	// For this example, we'll use some dummy data.
	const rawData = [
		{
			source_id: 'doc-001',
			content: 'Svelte 5 introduces runes, a new way to handle reactivity.',
			metadata: { page: 1 }
		},
		{
			source_id: 'doc-001',
			content: 'Runes like $state and $derived simplify component logic.',
			metadata: { page: 2 }
		},
		{
			source_id: 'doc-002',
			content: 'Supabase provides a suite of tools including a Postgres database and authentication.',
			metadata: { section: 'Introduction' }
		}
	];

	// --- TRANSFORM & LOAD ---
	try {
		await processAndLoadChunks(rawData);
		logger.info('ETL process completed successfully.');
	} catch (err) {
		const error = err as PostgrestError | Error;
		// CORRECTED: Pass a string message and the error object in the context
		logger.error('The ETL process failed with a critical error.', { error });
		process.exit(1);
	}
}

main();