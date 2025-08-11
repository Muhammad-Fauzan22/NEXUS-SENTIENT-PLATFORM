// scripts/etl.ts
// Pipeline ETL (Extract, Transform, Load) lengkap untuk membangun Knowledge Base.
// Menjalankan semua langkah secara berurutan: Ekstrak, Chunk, Vektorisasi, dan Muat ke Supabase.

import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../src/lib/server/utils/logger';
import { azureProvider } from '../src/lib/server/ai/providers/azure';
import { supabaseAdmin } from '../src/lib/server/supabaseAdmin';
import { config } from '../src/lib/server/config';

// --- Konfigurasi ---
const RAW_DATA_DIR = path.join(process.cwd(), 'data', 'raw');
const KNOWLEDGE_CHUNKS_TABLE = 'knowledge_chunks';
const CHUNK_SIZE = 1500; // Ukuran karakter per chunk
const CHUNK_OVERLAP = 200; // Tumpang tindih antar chunk

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
			logger.debug(`Berhasil mengekstrak teks dari ${file}`);
		}
	}
	logger.info(`Ekstraksi selesai. ${documents.length} dokumen diproses.`);
	return documents;
}

// --- Langkah 2: Chunking Teks ---
function chunkDocument(doc: RawDocument): Omit<KnowledgeChunk, 'content_embedding' | 'id'>[] {
	const chunks: Omit<KnowledgeChunk, 'content_embedding' | 'id'>[] = [];
	let i = 0;
	while (i < doc.content.length) {
		const end = i + CHUNK_SIZE;
		const chunkText = doc.content.substring(i, end);
		chunks.push({
			source_document: doc.source,
			content_text: chunkText
		});
		i += CHUNK_SIZE - CHUNK_OVERLAP;
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
			vectorizedChunks.push({
				...chunk,
				id: uuidv4(),
				content_embedding: embedding
			});
			logger.debug(`Chunk ${index + 1}/${chunks.length} berhasil divektorisasi.`);
		} catch (error) {
			logger.error({ err: error, chunk }, `Gagal memvektorisasi chunk ${index + 1}.`);
		}
	}
	logger.info('Vektorisasi selesai.');
	return vectorizedChunks;
}

// --- Langkah 4: Muat ke Supabase ---
async function loadToSupabase(chunks: KnowledgeChunk[]) {
	logger.info('Memulai fase pemuatan data ke Supabase...');

	// Hapus data lama
	logger.debug(`Menghapus data lama dari tabel ${KNOWLEDGE_CHUNKS_TABLE}...`);
	const { error: deleteError } = await supabaseAdmin.from(KNOWLEDGE_CHUNKS_TABLE).delete().neq('id', uuidv4()); // delete all
	if (deleteError) {
		logger.error({ error: deleteError }, 'Gagal menghapus data lama.');
		throw new InternalServerError('Gagal membersihkan knowledge base lama.');
	}

	// Masukkan data baru
	logger.debug(`Memasukkan ${chunks.length} chunk baru...`);
	const { error: insertError } = await supabaseAdmin.from(KNOWLEDGE_CHUNKS_TABLE).insert(chunks);
	if (insertError) {
		logger.error({ error: insertError }, 'Gagal memasukkan chunk baru.');
		throw new InternalServerError('Gagal memuat knowledge base baru.');
	}

	logger.info('Pemuatan data ke Supabase selesai.');
}

// --- Fungsi Utama Pipeline ETL ---
async function runEtlPipeline() {
	logger.info('--- MEMULAI PIPELINE ETL KNOWLEDGE BASE ---');
	try {
		// 1. Ekstrak
		const rawDocs = await extractAllRawData();

		// 2. Transform (Chunk)
		const allChunksToVectorize = rawDocs.flatMap(chunkDocument);

		// 3. Transform (Vectorize)
		const vectorizedChunks = await vectorizeChunks(allChunksToVectorize);

		// 4. Load
		await loadToSupabase(vectorizedChunks);

		logger.info('--- PIPELINE ETL KNOWLEDGE BASE BERHASIL ---');
	} catch (error) {
		logger.error({ err: error }, '--- PIPELINE ETL KNOWLEDGE BASE GAGAL ---');
		process.exit(1);
	}
}

// Jalankan pipeline
runEtlPipeline();
