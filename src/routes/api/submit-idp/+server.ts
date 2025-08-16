import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

import { z } from 'zod';
// Inisialisasi Supabase client
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * API endpoint untuk menerima data form Individual Development Plan (IDP)
 * dan menyimpannya ke database Supabase
 * @param request - HTTP request yang berisi data form IDP
 * @returns Respons JSON yang menunjukkan status penerimaan data
const IdpFormSchema = z.object({
	personal: z.object({
		fullName: z.string().min(1).max(200),
		email: z.string().email().max(320),
		whatsapp: z.string().min(5).max(32).optional().or(z.literal('')).transform((v) => v || null),
		origin: z.string().max(120).optional().or(z.literal('')).transform((v) => v || null)
	}),
	academic: z.object({
		gpa: z.union([z.number(), z.string()]).optional().transform((v) => (v === undefined ? null : Number(v))),
		favoriteCourses: z.string().max(1000).optional().or(z.literal('')).transform((v) => v || null),
		researchInterest: z.string().max(2000).optional().or(z.literal('')).transform((v) => v || null),
		tools: z.string().max(2000).optional().or(z.literal('')).transform((v) => v || null)
	}),
	psychometric: z.record(z.string(), z.unknown()).optional().default({})
});

 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Dapatkan sesi pengguna
		const session = await locals.getSession();

		// Tambahkan Perlindungan Rute: Periksa apakah pengguna sudah login
		if (!session) {
			throw error(401, 'Unauthorized: You must be logged in to submit data.');
		}

		// Ekstrak data dari body request
		const formData = await request.json();

		// Validasi sederhana untuk memastikan data utama ada
		if (!formData || !formData.personal || !formData.academic) {
			return json(
				{
					success: false,
					message: 'Data yang dikirim tidak lengkap.'
				},
				{ status: 400 }
			);
		}

		// Penyimpanan ke Supabase
		const { data, error: dbError } = await supabase
			.from('submissions') // Nama tabel di Supabase
			.insert([
				{
					user_id: session.user.id, // DATA PENTING YANG BARU
					full_name: formData.personal?.fullName,
					email: formData.personal?.email,
					whatsapp_number: formData.personal?.whatsapp,
					region: formData.personal?.origin,
					gpa: formData.academic?.gpa,
					favorite_courses: formData.academic?.favoriteCourses,
					research_interest: formData.academic?.researchInterest,
					mastered_software: formData.academic?.tools,
					psychometric_results: formData.psychometric // Simpan sebagai objek JSONB
				}
			])
			.select() // Minta data yang baru saja dimasukkan untuk dikembalikan
			.single(); // Karena kita hanya memasukkan satu baris

		// Periksa jika ada error dari Supabase
		if (dbError) {
			console.error('Supabase insert error:', dbError);
			throw error(500, 'Gagal menyimpan data ke database');
		}

		// Respons sukses
		return json(
			{
				success: true,
				message: 'Data berhasil disimpan!',
				submissionId: data.id
			},
			{ status: 200 }
		);
	} catch (err) {
		// Tangani error parsing JSON atau error lainnya
		console.error('Error processing IDP submission:', err);

		// Jika ini adalah error SvelteKit yang sudah kita throw, lempar ulang
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		// Untuk error lainnya, kembalikan error 500
		throw error(500, 'Terjadi kesalahan saat memproses data');
	}
};