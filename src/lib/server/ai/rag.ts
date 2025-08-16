import { supabaseAdmin } from '$lib/server/supabase';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';
import { embeddingProvider } from './providers/embeddings';

// Definisikan tipe untuk knowledge chunk yang diambil dari database
interface KnowledgeChunk {
	id: string;
	content_text: string;
	similarity: number; // Disediakan oleh fungsi RPC Supabase
}

const MATCH_THRESHOLD = 0.2; // Ambang batas kemiripan minimum (lebih rendah untuk menangkap lebih banyak)
const MATCH_COUNT = 10; // Jumlah maksimum potongan konteks yang akan diambil

/**
 * Mengambil potongan pengetahuan yang relevan dari database vektor
 * berdasarkan sebuah query teks.
 *
 * @param queryText - Teks query (misalnya, aspirasi karir pengguna).
 * @returns Sebuah promise yang resolve menjadi array KnowledgeChunk.
 */
export async function retrieveContext(queryText: string): Promise<KnowledgeChunk[]> {
	if (!queryText) {
		logger.warn('Query teks untuk retrieval kosong. Melewatkan pencarian konteks.');
		return [];
	}

	try {
		// Langkah 1: Ubah query teks menjadi embedding vektor menggunakan provider embedding lokal/compat.
		logger.info(`Membuat embedding untuk query RAG: ${queryText.substring(0, 50)}...`);
		const queryEmbedding = await embeddingProvider.generateEmbedding(queryText);

		// Langkah 2: Panggil fungsi RPC di Supabase untuk melakukan pencarian kemiripan
		logger.info('Memanggil fungsi RPC match_knowledge_chunks di Supabase...');
		const { data, error } = await supabaseAdmin.rpc('match_knowledge_chunks', {
			query_embedding: queryEmbedding,
			match_threshold: MATCH_THRESHOLD,
			match_count: MATCH_COUNT
		});

		if (error) {
			logger.error(`Gagal saat memanggil fungsi RPC Supabase: ${error.message}`);
			throw new InternalServerError('Gagal melakukan pencarian konteks.');
		}

		if (!data || data.length === 0) {
			logger.info(`Tidak ada konteks relevan yang ditemukan untuk query: ${queryText.substring(0, 50)}...`);
			return [];
		}

		logger.info(`Konteks relevan berhasil diambil. Jumlah: ${data.length}`);
		return data as KnowledgeChunk[];
	} catch (e: any) {
		logger.error(`Terjadi error tak terduga dalam pipeline RAG untuk query: ${queryText.substring(0, 50)}... Error: ${e.message}`);
		// Mengembalikan array kosong untuk memastikan sistem tetap bisa berjalan
		// meskipun RAG gagal.
		return [];
	}
}