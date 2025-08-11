import { z } from 'zod';

// Skema untuk skor RIASEC
export const riasecSchema = z.object({
	R: z.number().int().min(1).max(5),
	I: z.number().int().min(1).max(5),
	A: z.number().int().min(1).max(5),
	S: z.number().int().min(1).max(5),
	E: z.number().int().min(1).max(5),
	C: z.number().int().min(1).max(5)
});

// Skema untuk skor Psychological Well-Being (PWB)
export const pwbSchema = z.object({
	self_acceptance: z.number().int().min(1).max(5),
	positive_relations: z.number().int().min(1).max(5),
	autonomy: z.number().int().min(1).max(5),
	environmental_mastery: z.number().int().min(1).max(5),
	purpose_in_life: z.number().int().min(1).max(5),
	personal_growth: z.number().int().min(1).max(5)
});

/**
 * Skema validasi Zod untuk data asesmen lengkap yang dikirim dari frontend.
 * Ini adalah "kontrak" data yang ketat antara frontend dan backend.
 */
export const assessmentSchema = z.object({
	riasec_scores: riasecSchema,
	pwb_scores: pwbSchema,
	portfolio_text: z.string().min(100, 'Teks portofolio minimal harus 100 karakter.'),
	aspirations: z.string().min(20, 'Aspirasi karir minimal harus 20 karakter.')
});

/**
 * Tipe TypeScript yang diinferensi secara otomatis dari skema Zod.
 * Ini memastikan bahwa tipe data kita selalu sinkron dengan aturan validasi.
 */
export type AssessmentSubmission = z.infer<typeof assessmentSchema>;

/**
 * Tipe untuk objek IDP yang digenerate oleh AI.
 */
export interface GeneratedIDP {
	linkedin_summary: string;
	potential_analysis: string;
	career_goals_analysis: string;
	roadmap: Array<{
		semester: number;
		theme: string;
		academic: object;
		non_academic: object;
	}>;
}
