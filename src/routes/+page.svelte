import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

/**
 * API endpoint untuk menerima data form Individual Development Plan (IDP)
 * @param request - HTTP request yang berisi data form IDP
 * @returns Respons JSON yang menunjukkan status penerimaan data
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
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

		// Logika sukses (placeholder)
		// Di masa depan, di sinilah logika untuk menyimpan ke Supabase akan ditempatkan
		console.log('Menerima data IDP untuk diproses:', formData);

		// Kembalikan respons sukses dengan submissionId tiruan
		return json(
			{ 
				success: true, 
				message: 'Data berhasil diterima!', 
				submissionId: `NEXUS-${Date.now()}` 
			}, 
			{ status: 200 }
		);
	} catch (error) {
		// Tangani error parsing JSON atau error lainnya
		console.error('Error processing IDP submission:', error);
		return json(
			{ 
				success: false, 
				message: 'Terjadi kesalahan saat memproses data.' 
			}, 
			{ status: 500 }
		);
	}
};