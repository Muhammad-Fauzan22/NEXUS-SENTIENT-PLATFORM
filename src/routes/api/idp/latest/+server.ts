import { json, error, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { supabaseAdmin } from '$lib/server/supabase';

const QuerySchema = z.object({ profile_id: z.string().min(1) });

export const GET: RequestHandler = async ({ url }) => {
	const profile_id = url.searchParams.get('profile_id');
	const parsed = QuerySchema.safeParse({ profile_id });
	if (!parsed.success) throw error(400, 'Missing or invalid profile_id');

	const { data, error: dbErr } = await supabaseAdmin
		.from('idp_records')
		.select('id, created_at, json_content, html_content, status, pdf_url')
		.eq('profile_id', parsed.data.profile_id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (dbErr) {
		console.error('Failed to fetch latest IDP record', dbErr);
		throw error(500, 'Database error');
	}

	if (!data) {
		return json({ exists: false });
	}

	return json({ exists: true, record: data });
};
