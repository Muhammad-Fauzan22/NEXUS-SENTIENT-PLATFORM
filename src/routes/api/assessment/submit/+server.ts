import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

/**
 * API endpoint untuk menerima data dari form assessment dan menyimpannya ke database
 * @param request - HTTP request yang berisi data profil mahasiswa
 * @returns Respons JSON yang menunjukkan status pemrosesan
const ProfileSchema = z
	.object({
		full_name: z.string().min(1).max(200),
		email: z.string().email().max(320),
		whatsapp_number: z.string().min(5).max(32).optional().or(z.literal('')).transform((v) => v || null),
		region: z.string().max(120).optional().or(z.literal('')).transform((v) => v || null),
		gpa: z.union([z.number(), z.string()]).optional().transform((v) => (v === undefined ? null : Number(v))),
		favorite_courses: z.string().max(1000).optional().or(z.literal('')).transform((v) => v || null),
		research_interest: z.string().max(2000).optional().or(z.literal('')).transform((v) => v || null),
		mastered_software: z.string().max(2000).optional().or(z.literal('')).transform((v) => v || null),
		psychometric_results: z.record(z.string(), z.unknown()).optional().default({})
	})
	.strict()
	.passthrough();

 */
export async function POST({ request }) {
	// Validasi keamanan: Periksa API key dari header Authorization
	const authHeader = request.headers.get('Authorization');
	const expectedApiKey = env.INGEST_API_KEY;

	if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
		return json(
			{ error: 'Unauthorized' },
			{ status: 401 }
		);
	}

	try {
		// Parsing dan validasi data dari request body
		const raw = await request.json();
		const parsed = ProfileSchema.safeParse(raw);
		if (!parsed.success) {
			return json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
		}

		// Tambahkan timestamp jika tidak ada
		const profileData = {
			...parsed.data,
			createdAt: raw.createdAt || new Date().toISOString()
		};

		// Simpan data ke tabel profiles di Supabase
		const { data: newProfile, error } = await supabaseAdmin
			.from('profiles')
			.insert(profileData)
			.select()
			.single();

		// Penanganan error dari Supabase
		if (error) {
			console.error('Supabase insert error:', error);
			return json(
				{
					message: 'Failed to save data to database',
					details: error.message
				},
				{ status: 500 }
			);
		}

		// TODO: Trigger AI processing pipeline

		// Respons sukses dengan data yang baru dibuat
		return json(
			{
				message: 'Data submitted successfully',
				profile: newProfile
			},
			{ status: 201 }
		);
	} catch (error) {
		// Tangani error parsing JSON atau error lainnya
		console.error('Request processing error:', error);
		return json(
			{ error: 'Invalid JSON payload' },
			{ status: 400 }
		);
	}
}