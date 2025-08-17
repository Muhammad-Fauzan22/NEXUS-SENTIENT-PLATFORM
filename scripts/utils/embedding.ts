import { createHash } from 'node:crypto';

// Placeholder: if you have OpenAI or local embedding, swap implementation here
// Target dimension aligned with DB (1536)
function hashToFloats(seed: string, dim: number): number[] {
	const arr: number[] = [];
	let salt = 0;
	while (arr.length < dim) {
		const h = createHash('sha256').update(seed + ':' + salt++).digest();
		for (let i = 0; i < h.length && arr.length < dim; i += 4) {
			const v = h.readInt32BE(i);
			arr.push(((v >>> 0) % 1000) / 1000);
		}
	}
	return arr;
}

export async function getEmbedding(text: string, dim = 1536): Promise<number[]> {
	return hashToFloats(text, dim);
}

export async function getEmbedding768(text: string): Promise<number[]> {
	return hashToFloats(text, 768);
}

export async function getEmbedding1536(text: string): Promise<number[]> {
	return hashToFloats(text, 1536);
}
