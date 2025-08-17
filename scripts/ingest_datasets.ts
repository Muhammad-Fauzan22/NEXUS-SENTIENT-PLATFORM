import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { supabaseAdmin } from '../src/lib/server/db/supabase.admin';
import { logger } from '../src/lib/server/utils/logger';
import { generateEmbedding as embed } from '../src/lib/server/ai/providers/embeddings';

dotenv.config({ path: './.env' });

const ROOT = path.resolve(process.cwd(), 'datasets');
const MAX_FILES = 1000;
const CHUNK_SIZE = 1000;
const OVERLAP = 150;

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

function chunkText(text: string, size = CHUNK_SIZE, overlap = OVERLAP): string[] {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + size, clean.length);
    chunks.push(clean.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks;
}

async function ingestFile(filePath: string) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.txt', '.csv', '.json', '.md'].includes(ext)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const chunks = chunkText(content);
    const rel = path.relative(ROOT, filePath);
    const segments = rel.split(path.sep);
    const category = segments.length > 0 ? segments[0] : 'unknown';
    const subpath = segments.slice(1, -1).join('/');
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const embedding = await embed(chunk);
      const source_id = rel;
      const { error } = await supabaseAdmin.from('knowledge_chunks').insert({
        source_id,
        content: chunk,
        content_embedding: embedding,
        metadata: { idx, ext, source: 'dataset', category, subpath }
      });
      if (error) logger.error('Failed insert dataset chunk', { error, filePath });
    }
    logger.info('Ingested file', { filePath, chunkCount: chunks.length, category });
  } catch (e) {
    logger.error('Ingest failed for file', { filePath, error: e });
  }
}

async function main() {
  logger.info('Dataset ingestion started');
  if (!fs.existsSync(ROOT)) {
    logger.warn('No ./datasets folder found. Skipping.');
    return;
  }
  const files = walkFiles(ROOT);
  for (const f of files) {
    await ingestFile(f);
  }
  logger.info('Dataset ingestion completed');
}

main();

