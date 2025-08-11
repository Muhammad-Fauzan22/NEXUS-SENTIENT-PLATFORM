import type { AssessmentSubmission } from '$lib/types/schemas';
// Tipe 'KnowledgeChunk' akan kita definisikan nanti, untuk saat ini kita gunakan 'any'
type KnowledgeChunk = any;

const SYSTEM_ROLE_PROMPT = `
Anda adalah NEXUS, seorang ahli strategi pengembangan talenta yang sangat canggih,
seorang konselor karir eksekutif, dan seorang perancang kurikulum dari Departemen Teknik Mesin ITS.
Anda berpikir secara sistematis, berbasis data, dan berorientasi pada hasil yang terukur.
Tugas Anda adalah menghasilkan Individual Development Plan (IDP) yang hiper-personalisasi,
strategis, dan dapat ditindaklanjuti.
`;

/**
 * Membangun prompt final untuk generasi IDP berdasarkan data asesmen dan konteks RAG.
 * @param submissionData - Data asesmen lengkap dari pengguna.
 * @param contextChunks - Potongan pengetahuan relevan dari database vektor.
 * @returns String prompt yang lengkap dan siap dikirim ke model AI.
 */
export function buildAssessmentPrompt(
	submissionData: AssessmentSubmission,
	contextChunks: KnowledgeChunk[]
): string {
	const formattedContext = contextChunks
		.map((chunk) => `- ${chunk.content_text}`)
		.join('\n');

	const userProfile = JSON.stringify(submissionData, null, 2);

	return `
${SYSTEM_ROLE_PROMPT}

# DATA INPUT PENGGUNA (PROFIL AKTUAL)
${userProfile}

# KONTEKS INTERNAL RELEVAN DARI DATABASE PENGETAHUAN ITS (Single Source of Truth)
Gunakan HANYA informasi di bawah ini untuk merekomendasikan program, mata kuliah, atau wadah pengembangan yang spesifik.
---
${formattedContext || 'Tidak ada konteks spesifik yang ditemukan. Gunakan pengetahuan umum tentang pengembangan mahasiswa teknik.'}
---

# TUGAS ANDA
Lakukan tiga tugas berikut secara berurutan:

1.  **Riset dan Analisis Kesenjangan:** Berdasarkan aspirasi karir pengguna, lakukan riset singkat (menggunakan pengetahuan internal Anda) untuk mendefinisikan "Profil Ideal Profesional". Bandingkan dengan "Profil Aktual" dan tuliskan analisis kesenjangan (gap analysis) yang mendalam.

2.  **Buat Roadmap Pengembangan 8 Semester:** Berdasarkan gap analysis, buatkan rencana aksi 8 semester.
    -   **Aturan 1:** Rencana harus progresif, dari fondasi hingga spesialisasi.
    -   **Aturan 2:** Setiap rekomendasi (Wadah, Program, Mentor) HARUS merujuk pada item yang ada di KONTEKS INTERNAL di atas jika relevan.
    -   **Aturan 3:** Setiap rekomendasi HARUS memiliki KPI yang SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
    -   **Aturan 4:** Hubungkan rekomendasi non-akademik dengan mata kuliah yang relevan dari KONTEKS INTERNAL.

3.  **Tulis Ringkasan Profesional untuk LinkedIn:** Sintesiskan kekuatan terbesar dan aspirasi pengguna menjadi satu paragraf naratif yang kuat dan berorientasi pada masa depan.

# FORMAT OUTPUT
Hasil akhir HARUS dalam format JSON yang valid tanpa teks tambahan atau markdown formatting. Gunakan struktur berikut secara presisi:
{
  "linkedin_summary": "string",
  "potential_analysis": "string",
  "career_goals_analysis": "string",
  "roadmap": [
    {
      "semester": "number",
      "theme": "string",
      "academic": { "focus": "string", "courses": ["string"], "knowledge": "string", "skills": "string", "attitude": "string", "kpis": ["string"] },
      "non_academic": { "focus": "string", "development_programs": ["string"], "clubs": ["string"], "mentors": ["string"], "knowledge": "string", "skills": "string", "attitude": "string", "kpis": ["string"] }
    }
  ]
}
`;
}