import { supabaseAdmin } from '$lib/server/supabase';
import { embeddingProvider } from '$lib/server/ai/providers/embedding';

export type ExcellenceDoc = {
	id: string;
	title?: string;
	url?: string;
	path?: string;
	content: string;
	content_hash: string;
	similarity: number;
};

export async function retrieveExcellenceContext(
	query: string,
	limit = 5
): Promise<ExcellenceDoc[]> {
	const emb = await embeddingProvider.generateEmbedding(query);
	const { data, error } = await supabaseAdmin.rpc('match_excellence_docs', {
		query_embedding: emb,
		match_threshold: 0.75,
		match_count: limit
	});
	if (error || !data) return [];
	return data as ExcellenceDoc[];
}
