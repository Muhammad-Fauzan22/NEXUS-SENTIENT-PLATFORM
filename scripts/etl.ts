// scripts/etl.ts
// Pipeline ETL (Extract, Transform, Load) lengkap untuk membangun Knowledge Base.

import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../src/lib/server/utils/logger';
import { azureProvider } from '../src/lib/server/ai/providers/azure';
import { supabaseAdmin } from '../src/lib/server/supabaseAdmin';
import { InternalServerError } from '../src/lib/server/utils/errors';

// --- Konfigurasi ---
const RAW_DATA_DIR = path.join(process.cwd(), 'data', 'raw');
const KNOWLEDGE_CHUNKS_TABLE = 'knowledge_chunks';
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

// --- Tipe Data ---
interface RawDocument {
	source: string;
	content: string;
}

interface KnowledgeChunk {
	id: string;
	source_document: string;
	content_text: string;
	content_embedding: number[];
}

// --- Langkah 1: Ekstraksi Teks ---
async function extractTextFromDoc(filePath: string): Promise<string> {
	const extension = path.extname(filePath).toLowerCase();
	if (extension === '.pdf') {
		const dataBuffer = await fs.readFile(filePath);
		const data = await pdf(dataBuffer);
		return data.text;
	}
	if (extension === '.docx') {
		const { value } = await mammoth.extractRawText({ path: filePath });
		return value;
	}
	if (extension === '.txt') {
		return fs.readFile(filePath, 'utf-8');
	}
	logger.warn(`Format file tidak didukung: ${extension}`);
	return '';
}

async function extractAllRawData(): Promise<RawDocument[]> {
	logger.info('Memulai fase ekstraksi teks...');
	const files = await fs.readdir(RAW_DATA_DIR);
	const documents: RawDocument[] = [];
	for (const file of files) {
		const filePath = path.join(RAW_DATA_DIR, file);
		const content = await extractTextFromDoc(filePath);
		if (content) {
			documents.push({ source: file, content });
		}
	}
	return documents;
}

// --- Langkah 2: Chunking Teks ---
function chunkDocument(doc: RawDocument): Omit<KnowledgeChunk, 'content_embedding' | 'id'>[] {
	const chunks: Omit<KnowledgeChunk, 'content_embedding' | 'id'>[] = [];
	for (let i = 0; i < doc.content.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
		const chunkText = doc.content.substring(i, i + CHUNK_SIZE);
		chunks.push({
			source_document: doc.source,
			content_text: chunkText
		});
	}
	return chunks;
}

// --- Langkah 3: Vektorisasi Chunks ---
async function vectorizeChunks(
	chunks: Omit<KnowledgeChunk, 'content_embedding' | 'id'>[]
): Promise<KnowledgeChunk[]> {
	logger.info(`Memulai fase vektorisasi untuk ${chunks.length} chunk...`);
	const vectorizedChunks: KnowledgeChunk[] = [];
	for (const [index, chunk] of chunks.entries()) {
		try {
			const embedding = await azureProvider.generateEmbedding(chunk.content_text);
			vectorizedChunks.push({ ...chunk, id: uuidv4(), content_embedding: embedding });
			logger.debug(`Chunk ${index + 1}/${chunks.length} berhasil divektorisasi.`);
		} catch (error) {
			logger.error({ err: error, chunk }, `Gagal memvektorisasi chunk ${index + 1}.`);
		}
	}
	return vectorizedChunks;
}

// --- Langkah 4: Muat ke Supabase ---
async function loadToSupabase(chunks: KnowledgeChunk[]) {
	logger.info('Memulai fase pemuatan data ke Supabase...');

	// Hapus data lama
	const { error: deleteError } = await supabaseAdmin.from(KNOWLEDGE_CHUNKS_TABLE).delete().neq('id', uuidv4());
	if (deleteError) {
		throw new InternalServerError('Gagal membersihkan knowledge base lama.');
	}

	// Ubah embedding menjadi string dan masukkan data baru
	const chunksToInsert = chunks.map(chunk => ({
        ...chunk,
        content_embedding: `[${chunk.content_embedding.join(',')}]`
    }));

	const { error: insertError } = await supabaseAdmin.from(KNOWLEDGE_CHUNKS_TABLE).insert(chunksToInsert);
	if (insertError) {
		logger.error({ error: insertError }, 'Gagal memasukkan chunk baru.');
		throw new InternalServerError('Gagal memuat knowledge base baru.');
	}
}

// --- Fungsi Utama Pipeline ETL ---
async function runEtlPipeline() {
	logger.info('--- MEMULAI PIPELINE ETL KNOWLEDGE BASE ---');
	try {
		const rawDocs = await extractAllRawData();
		const allChunksToVectorize = rawDocs.flatMap(chunkDocument);
		const vectorizedChunks = await vectorizeChunks(allChunksToVectorize);
		await loadToSupabase(vectorizedChunks);
		logger.info('--- PIPELINE ETL KNOWLEDGE BASE BERHASIL ---');
	} catch (error) {
		logger.error({ err: error }, '--- PIPELINE ETL KNOWLEDGE BASE GAGAL ---');
		process.exit(1);
	}
}

runEtlPipeline();