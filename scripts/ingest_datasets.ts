import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { supabaseAdmin } from './utils/supabase.admin.ts';
import { logger } from './utils/logger.ts';
import { getEmbedding as embed } from './utils/embedding.ts';

dotenv.config({ path: './.env' });

const ROOT = path.resolve(process.cwd(), 'datasets');
const MAX_FILES = 1000;
const CHUNK_SIZE = 1000;
const OVERLAP = 150;

const targetDir = process.argv.includes('--dir')
	? path.resolve(process.argv[process.argv.indexOf('--dir') + 1])
	: ROOT;

function walkFiles(dir: string): string[] {
	const out: string[] = [];
	const stack = [dir];
	while (stack.length) {
		const d = stack.pop()!;
		if (!fs.existsSync(d)) continue;
		for (const e of fs.readdirSync(d)) {
			const p = path.join(d, e);
			const st = fs.statSync(p);
			if (st.isDirectory()) stack.push(p);
			else out.push(p);
			if (out.length >= MAX_FILES) return out;
		}
	}
	return out;
}

const MAX_CHUNKS_PER_FILE = 200;

async function ingestFile(filePath: string) {
	try {
		const ext = path.extname(filePath).toLowerCase();
		if (!['.txt', '.csv', '.json', '.md'].includes(ext)) return;

		const rel = path.relative(ROOT, filePath);
		const segments = rel.split(path.sep);
		const category = segments.length > 0 ? segments[0] : 'unknown';
		const subpath = segments.slice(1, -1).join('/');

		// Stream read to avoid OOM
		const rs = fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 });
		let buffer = '';
		let produced = 0;
		let idx = 0;
		await new Promise<void>((resolve, reject) => {
			rs.on('data', async (chunk: string) => {
				// accumulate and normalize whitespace
				buffer += (chunk || '').replace(/\s+/g, ' ');
				// produce fixed-size windows with overlap
				while (buffer.length >= CHUNK_SIZE && produced < MAX_CHUNKS_PER_FILE) {
					const piece = buffer.slice(0, CHUNK_SIZE);
					try {
						const embedding = await embed(piece);
						const source_id = rel;
						const { error } = await supabaseAdmin.from('knowledge_chunks').insert({
							content_text: piece,
							content_embedding: embedding,
							metadata: { idx, ext, source: 'dataset', category, subpath, source_id }
						});
						if (error) logger.error('Failed insert dataset chunk', { error, filePath });
						idx++;
						produced++;
					} catch (err) {
						logger.error('Embedding/insert failed', { filePath, error: err });
					}
					// keep overlap
					buffer = buffer.slice(CHUNK_SIZE - OVERLAP);
				}
			});
			rs.on('end', async () => {
				try {
					if (buffer.length > Math.max(OVERLAP, 50) && produced < MAX_CHUNKS_PER_FILE) {
						const piece = buffer;
						const embedding = await embed(piece);
						await supabaseAdmin.from('knowledge_chunks').insert({
							content_text: piece,
							content_embedding: embedding,
							metadata: { idx, ext, source: 'dataset', category, subpath, source_id: rel }
						});
						idx++;
						produced++;
					}
					logger.info('Ingested file', { filePath, chunkCount: produced, category });
					resolve();
				} catch (err) {
					reject(err);
				}
			});
			rs.on('error', (err) => reject(err));
		});
	} catch (e) {
		logger.error('Ingest failed for file', { filePath, error: e });
	}
}

async function main() {
	logger.info('Dataset ingestion started', { targetDir });
	if (!fs.existsSync(targetDir)) {
		logger.warn(`No dataset folder found at ${targetDir}. Skipping.`);
		return;
	}
	const files = walkFiles(targetDir);
	for (const f of files) {
		await ingestFile(f);
	}
	logger.info('Dataset ingestion completed', { fileCount: files.length });
}

main();
