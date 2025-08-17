import { describe, it, expect } from 'vitest';
import { generatedIdpSchema } from '../../src/lib/types/schemas';

describe('generatedIdpSchema', () => {
  it('accepts a minimal valid object', () => {
    const minimal = { linkedin_summary: '', potential_analysis: '', career_goals_analysis: '', roadmap: [] };
    const parsed = generatedIdpSchema.safeParse(minimal);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid types', () => {
    const bad = { linkedin_summary: 123, roadmap: 'not-array' } as any;
    const parsed = generatedIdpSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });
});

