import { createHash } from 'node:crypto';

// Placeholder: if you have OpenAI or local embedding, swap implementation here
export async function getEmbedding(text: string): Promise<number[]> {
  // Simple deterministic pseudo-embedding to keep pipeline working without external API
  const h = createHash('sha256').update(text).digest();
  const arr: number[] = [];
  for (let i = 0; i < h.length; i += 4) {
    const v = h.readInt32BE(i);
    arr.push((v % 1000) / 1000);
  }
  // pad/truncate to 768 dims
  while (arr.length < 768) arr.push(0);
  return arr.slice(0, 768);
}

