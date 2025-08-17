import { json, error, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import type { Database } from '$lib/types/database.types';
import { supabaseAdmin } from '$lib/server/supabase';
import { generateIdp } from '$lib/server/ai/idp.generator';
import { formatIdp } from '$lib/server/ai/idp.formatter';
import { generatedIdpSchema } from '$lib/types/schemas';

const BodySchema = z.object({ profile_id: z.string().min(1) });

type StructuredProfile = Database['public']['Tables']['processed_profiles']['Row'];

export const POST: RequestHandler = async ({ request }) => {
	const parse = BodySchema.safeParse(await request.json());
	if (!parse.success) throw error(400, 'Invalid body');

	const { profile_id } = parse.data;

	// Ambil processed profile dari DB
	const { data: profile, error: profErr } = await supabaseAdmin
		.from('processed_profiles')
		.select('*')
		.eq('id', profile_id)
		.single();

	if (profErr || !profile) {
		throw error(404, 'Processed profile not found');
	}

	// Jalankan pipeline AI lokal untuk menghasilkan IDP JSON terstruktur
	let idpJson;
	try {
		idpJson = await generateIdp(profile as StructuredProfile);
	} catch (e) {
		console.error('IDP generation failed', e);
		throw error(500, 'Failed to generate IDP');
	}

	// Validasi runtime
	const valid = generatedIdpSchema.safeParse(idpJson);
	if (!valid.success) {
		console.error('IDP JSON failed schema validation', valid.error.flatten());
		throw error(500, 'Invalid IDP structure');
	}

	// Format HTML
	let html = '';
	try {
		html = formatIdp(valid.data);
	} catch (e) {
		console.error('Failed to format IDP HTML', e);
		throw error(500, 'Failed to format IDP');
	}

	// Simpan ke idp_records
	const insertPayload = {
		profile_id,
		json_content: valid.data as any,
		html_content: html,
		status: 'complete' as const,
		pdf_url: null,
		error_message: null
	};

	const { data: record, error: insErr } = await supabaseAdmin
		.from('idp_records')
		.insert(insertPayload)
		.select('id, created_at')
		.single();

	if (insErr) {
		console.error('Failed to insert idp_record', insErr);
		throw error(500, 'Failed to store IDP');
	}

	return json({ success: true, idp_record_id: record.id, idp: valid.data });
};
