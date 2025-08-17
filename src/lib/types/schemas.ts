import { z } from 'zod';

// =========================
// Input & Raw Data Schemas
// =========================

export interface PWBAnswer {
  question_id: number;
  score: number;
}

export interface RIASECAnswer {
  question_id: number;
  answer: 'yes' | 'no';
}

export interface UserData {
  name: string;
  email: string;
  age: number;
  occupation: string;
}

export interface AssessmentData {
  user_data: UserData;
  riasec_answers: RIASECAnswer[];
  pwb_answers: PWBAnswer[];
}

// =========================
// IDP (JSON) Schema expected by AI promptBuilder
// =========================

// This shape must match src/lib/server/ai/promptBuilder.ts output contract
export const roadmapItemSchema = z.object({
  semester: z.union([z.number(), z.string()]),
  theme: z.string().min(1),
  academic: z.object({
    focus: z.string().default(''),
    courses: z.array(z.string()).default([]),
    knowledge: z.string().default(''),
    skills: z.string().default(''),
    attitude: z.string().default(''),
    kpis: z.array(z.string()).default([])
  }),
  non_academic: z.object({
    focus: z.string().default(''),
    development_programs: z.array(z.string()).default([]),
    clubs: z.array(z.string()).default([]),
    mentors: z.array(z.string()).default([]),
    knowledge: z.string().default(''),
    skills: z.string().default(''),
    attitude: z.string().default(''),
    kpis: z.array(z.string()).default([])
  })
});

export const generatedIdpSchema = z.object({
  linkedin_summary: z.string().default(''),
  potential_analysis: z.string().default(''),
  career_goals_analysis: z.string().default(''),
  roadmap: z.array(roadmapItemSchema).default([])
});

export type GeneratedIDP = z.infer<typeof generatedIdpSchema>;

// =========================
// AssessmentSubmission used by idp.generator.ts prompt builder
// =========================

export interface AssessmentSubmission {
  aspirations: string;
  portfolio_text: string;
  // Scores are flexible key-value maps; keep them permissive
  riasec_scores: Record<string, unknown>;
  pwb_scores: Record<string, unknown>;
}
