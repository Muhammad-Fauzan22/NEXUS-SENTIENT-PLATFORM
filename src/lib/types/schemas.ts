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
 */
export const assessmentSchema = z.object({
	riasec_scores: riasecSchema,
	pwb_scores: pwbSchema,
	portfolio_text: z.string().min(100, 'Teks portofolio minimal harus 100 karakter.'),
	aspirations: z.string().min(20, 'Aspirasi karir minimal harus 20 karakter.')
});

export type AssessmentSubmission = z.infer<typeof assessmentSchema>;

// --- Tipe Spesifik untuk Output IDP dari AI ---

const developmentAreaSchema = z.object({
    focus: z.string(),
    courses: z.array(z.string()).optional(),
    development_programs: z.array(z.string()).optional(),
    clubs: z.array(z.string()).optional(),
    mentors: z.array(z.string()).optional(),
    knowledge: z.string(),
    skills: z.string(),
    attitude: z.string(),
    kpis: z.array(z.string())
});

const semesterRoadmapSchema = z.object({
    semester: z.number(),
    theme: z.string(),
    academic: developmentAreaSchema,
    non_academic: developmentAreaSchema
});

/**
 * Skema Zod untuk memvalidasi output JSON dari AI.
 * Ini memastikan bahwa data yang kita terima memiliki struktur yang kita harapkan.
 */
export const generatedIdpSchema = z.object({
    linkedin_summary: z.string(),
    potential_analysis: z.string(),
    career_goals_analysis: z.string(),
    roadmap: z.array(semesterRoadmapSchema)
});

/**
 * Tipe TypeScript yang diinferensi dari skema Zod untuk IDP.
 */
export type GeneratedIDP = z.infer<typeof generatedIdpSchema>;