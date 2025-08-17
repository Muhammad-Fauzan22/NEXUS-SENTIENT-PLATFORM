import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

export const GET: RequestHandler = async ({ params }) => {
	const aspirasi = decodeURIComponent(params.aspirasi || '').trim();
	if (!aspirasi) return json({ topDemand: [], rising: [], articles: [] });

	try {
		// Top 5 skills by mention_count_7d
		const { data: topDemand, error: err1 } = await supabaseAdmin
			.from('skill_trends')
			.select('skill_name, mention_count_7d, velocity_score')
			.ilike('related_roles', `%${aspirasi}%`)
			.order('mention_count_7d', { ascending: false })
			.limit(5);

		// Top 3 rising skills by velocity_score
		const { data: rising, error: err2 } = await supabaseAdmin
			.from('skill_trends')
			.select('skill_name, mention_count_7d, velocity_score')
			.ilike('related_roles', `%${aspirasi}%`)
			.order('velocity_score', { ascending: false })
			.limit(3);

		// Latest 3 relevant articles
		const { data: articles, error: err3 } = await supabaseAdmin
			.from('scraped_articles')
			.select('title, url, published_at')
			.ilike('title', `%${aspirasi}%`)
			.order('published_at', { ascending: false })
			.limit(3);

		// If tables aren't present yet, fail gracefully
		if (err1 || err2 || err3) {
			return json({ topDemand: topDemand || [], rising: rising || [], articles: articles || [] });
		}

		return json({ topDemand: topDemand || [], rising: rising || [], articles: articles || [] });
	} catch {
		// fail safe
		return json({ topDemand: [], rising: [], articles: [] });
	}
};
