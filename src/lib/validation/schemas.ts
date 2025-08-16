import { z } from 'zod';

// API Input Validation Schemas
export const submissionIdSchema = z.object({
  submissionId: z.string().uuid()
});

export const userIdSchema = z.object({
  userId: z.string().uuid()
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// Security headers schema
export const securityHeadersSchema = z.object({
  'content-type': z.string().optional(),
  'x-content-type-options': z.string().optional(),
  'x-frame-options': z.string().optional(),
  'x-xss-protection': z.string().optional(),
  'strict-transport-security': z.string().optional()
});
