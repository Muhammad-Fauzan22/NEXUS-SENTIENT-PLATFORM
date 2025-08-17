import { createHash } from 'node:crypto';

// Placeholder: if you have OpenAI or local embedding, swap implementation here
// Target dimension aligned with DB (1536)
const TARGET_DIM = 1536;

export async function getEmbedding(text: string): Promise<number[]> {
	// Simple deterministic pseudo-embedding to keep pipeline working without external API
	const h = createHash('sha256').update(text).digest();
	const arr: number[] = [];
	for (let i = 0; i < h.length; i += 4) {
		const v = h.readInt32BE(i);
		arr.push(((v >>> 0) % 1000) / 1000);
	}
	// expand by hashing with different salts
	let salt = 1;
	while (arr.length < TARGET_DIM) {
		const hh = createHash('sha256')
			.update(text + ':' + salt++)
			.digest();
		for (let i = 0; i < hh.length && arr.length < TARGET_DIM; i += 4) {
			const v = hh.readInt32BE(i);
			arr.push(((v >>> 0) % 1000) / 1000);
		}
	}
	return arr.slice(0, TARGET_DIM);
}
