import { describe, it, expect } from 'vitest';
import {
	extractSkillsV2,
	normalizeSkill,
	computeVelocity
} from '../../src/lib/server/analytics/trends_analyzer';

describe('trends analyzer v2', () => {
	it('extracts multi-word phrases and normalizes synonyms', () => {
		const text =
			'Experience with Finite Element Analysis (FEA), Solid works, and Machine Learning.';
		const skills = extractSkillsV2(text);
		expect(skills).toContain('finite element analysis');
		expect(skills).toContain('fea');
		expect(skills).toContain('machine learning');
		expect(skills).toContain('solidworks');
	});

	it('computes velocity with smoothing', () => {
		const v = computeVelocity(5, 20);
		expect(v).toBeGreaterThan(0);
		expect(v).toBeLessThanOrEqual(1);
	});

	it('normalizes individual tokens', () => {
		expect(normalizeSkill('  C++  ')).toBe('c++');
		expect(normalizeSkill('Mat Lab')).toBe('mat lab'.toLowerCase());
	});
});
