import dotenv from 'dotenv';
import { supabaseAdmin } from '../src/lib/server/db/supabase.admin';
import { logger } from '../src/lib/server/utils/logger';
import type { PostgrestError } from '@supabase/supabase-js';
import { NotionService } from '../src/lib/server/integrations/notion.service';

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

// Simple text chunker for Notion/plain text
function chunkText(text: string, chunkSize = 1000, overlap = 150): string[] {
	const out: string[] = [];
	let i = 0;
	const clean = (text || '').replace(/\s+/g, ' ').trim();
	while (i < clean.length) {
		const end = Math.min(i + chunkSize, clean.length);
		out.push(clean.slice(i, end));
		i = end - overlap;
		if (i < 0) i = 0;
	}
	return out;
}

// Embedding provider (OpenAI-compatible). When not configured, falls back to random vector.
import { generateEmbedding as embed } from '../src/lib/server/ai/providers/embeddings';
async function getEmbedding(text: string): Promise<number[]> {
	logger.info(`Generating embedding for chunk... Length: ${text.length}`);
	return await embed(text);
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

	// --- EXTRACT from Notion (if configured) ---
	const notionDbId = process.env.NOTION_KB_DATABASE_ID || '';
	const notionToken = process.env.NOTION_API_KEY || '';
	let rawData: Omit<KnowledgeChunk, 'content_embedding' | 'id'>[] = [];

	if (notionDbId && notionToken) {
		logger.info('Fetching documents from Notion knowledge database...');
		const ns = new NotionService(notionToken);
		try {
			// Pull the first 20 pages to index; adjust per your needs
			const client: any = await (ns as any).getClient();
			const res = await client.databases.query({ database_id: notionDbId, page_size: 20 });
			for (const page of res.results as any[]) {
				const pageId = page.id;
				const title = (ns as any).extractTitle(page) || 'Untitled';
				const text = await (ns as any).getPagePlainText(client, pageId);
				const chunks = chunkText(text);
				for (let idx = 0; idx < chunks.length; idx++) {
					rawData.push({
						source_id: `${title}#${pageId}`,
						content: chunks[idx],
						metadata: { pageId, title, idx }
					});
				}
			}
		} catch (e) {
			logger.error('Failed to extract from Notion. Falling back to dummy data.', { error: e });
		}
	}

	// Fallback/dummy data if Notion not configured or failed
	if (rawData.length === 0) {
		logger.warn('Notion is not configured. Using dummy knowledge data.');
		rawData = [
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
	}

	// --- TRANSFORM & LOAD ---
	try {
		await processAndLoadChunks(rawData);
		logger.info('ETL process completed successfully.');
	} catch (err) {
		const error = err as PostgrestError | Error;
		logger.error('The ETL process failed with a critical error.', { error });
		process.exit(1);
	}
}

main();