// src/routes/api/generate-idp/+server.ts
import { error, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Inisialisasi Supabase client
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Inisialisasi Google AI client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * API endpoint untuk menghasilkan Individual Development Plan (IDP)
 * berdasarkan data pengajuan yang disimpan di database dengan streaming
 */

const BodySchema = z.object({ submissionId: z.string().min(1) });
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Dapatkan submissionId dari request body + validasi
		const parsedBody = BodySchema.safeParse(await request.json());
		if (!parsedBody.success) throw error(400, 'Invalid body');
		const { submissionId } = parsedBody.data;

		// Dapatkan sesi pengguna
		const session = await locals.getSession();

		// Verifikasi keamanan: Pengguna harus login
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		// Ambil data pengajuan dari Supabase berdasarkan ID
		const { data: submission, error: dbError } = await supabase
			.from('submissions')
			.select('*')
			.eq('id', submissionId)
			.single();

		// Periksa jika ada error saat mengambil data
		if (dbError || !submission) {
			throw error(404, 'Submission not found');
		}

		// Verifikasi kepemilikan: Pastikan pengguna adalah pemilik data
		if (submission.user_id !== session.user.id) {
			throw error(403, 'Forbidden');
		}

		// Setelah verifikasi kepemilikan, perbarui status menjadi 'Analyzing'
		const { error: updateError } = await supabase
			.from('submissions')
			.update({ status: 'Analyzing' })
			.eq('id', submissionId);

		// Penanganan error dasar untuk update status
		if (updateError) {
			console.error('Error updating status to Analyzing:', updateError);
		}

		// Rancang prompt dengan prompt engineering yang canggih
		const prompt = `
Anda adalah seorang konselor karir dan akademik ahli dari Departemen Teknik Mesin ITS. Tugas Anda adalah menganalisis profil mahasiswa dan menghasilkan Rencana Pengembangan Individu (IDP) yang personal dan ilmiah.

**PROFIL MAHASISWA:**

1. **Profil Personal:**
   - Nama Lengkap: ${submission.full_name}
   - Email: ${submission.email}
   - Nomor WhatsApp: ${submission.whatsapp_number || 'Tidak disediakan'}
   - Asal Daerah: ${submission.region || 'Tidak disediakan'}

2. **Profil Akademik:**
   - IPK Terakhir: ${submission.gpa || 'Tidak disediakan'}
   - Mata Kuliah Favorit: ${submission.favorite_courses || 'Tidak disediakan'}
   - Topik Riset/TA yang Diminati: ${submission.research_interest || 'Tidak disediakan'}
   - Software/Tools yang Dikuasai: ${submission.mastered_software || 'Tidak disediakan'}

3. **Hasil Asesmen Psikometri (RIASEC):**
   ${submission.psychometric_results ?
				Object.entries(submission.psychometric_results as Record<string, unknown>)
					.map(([key, value]) => `   - ${key}: ${value}`)
					.join('\n')
				: '   Data tidak tersedia'}

**TUGAS ANDA:**

Berdasarkan data di atas, lakukan Analisis Kesenjangan dan hasilkan Rencana Pengembangan Individu (IDP) 8 semester dalam format Markdown. Berikan rekomendasi konkret untuk mata kuliah, proyek, sertifikasi, dan kegiatan non-akademik yang selaras dengan profil mahasiswa dan Kurikulum Keprofesian HMM ITS.

**FORMAT OUTPUT:**

# INDIVIDUAL DEVELOPMENT PLAN (IDP) untuk ${submission.full_name}

## 1. Executive Summary
- Ringkasan profil dan potensi mahasiswa
- Visi karir jangka panjang

## 2. Gap Analysis
- Analisis kesenjangan antara profil saat ini dengan kompetensi yang dibutuhkan

## 3. Development Plan (Semester 1-8)
Untuk setiap semester:
### Semester [N]
- **Mata Kuliah yang Direkomendasikan**
- **Proyek/Praktikum yang Direkomendasikan**
- **Sertifikasi yang Direkomendasikan**
- **Kegiatan Non-Akademik**
- **Target Pembelajaran**

## 4. Resources & Support
- Sumber daya yang tersedia di ITS
- Kontak dosen/ahli yang relevan

## 5. Monitoring & Evaluation
- Cara memantau kemajuan
- Indikator keberhasilan

**PETUNJUK PENTING:**
- Gunakan bahasa yang profesional namun mudah dipahami mahasiswa tingkat akhir.
- Berikan rekomendasi yang spesifik, actionable, dan realistis.
- Pertimbangkan kurikulum Teknik Mesin ITS dan kebutuhan industri terkini.
- Format dalam Markdown dengan heading, bullet points, dan struktur yang jelas.
`;

		// Panggil Google Gemini API dengan streaming
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });
		const result = await model.generateContentStream(prompt);

		// Buat stream respons
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				try {
					// Loop melalui hasil streaming
					for await (const chunk of result.stream) {
						const chunkText = chunk.text();
						controller.enqueue(encoder.encode(chunkText));
					}

					// Setelah proses AI streaming selesai, perbarui status menjadi 'Complete'
					const { error: completeUpdateError } = await supabase
						.from('submissions')
						.update({ status: 'Complete' })
						.eq('id', submissionId);

					// Penanganan error dasar untuk update status complete
					if (completeUpdateError) {
						console.error('Error updating status to Complete:', completeUpdateError);
					}

					// Tutup stream setelah selesai
					controller.close();
				} catch (err) {
					controller.error(err);
				}
			}
		});

		// Kembalikan stream respons
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});

	} catch (err) {
		console.error('Error in IDP generation:', err);

		// Tangani error berdasarkan tipe
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error during IDP generation');
	}
};