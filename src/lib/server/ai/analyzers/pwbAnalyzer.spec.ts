import { describe, it, expect } from 'vitest';
import type { PWBAnswer } from '$lib/types/schemas/assessment';
// CORRECTED: Only import the specific function being tested.
import { calculatePWBScore } from './pwbAnalyzer';

describe('pwbAnalyzer Logic', () => {
	it('should correctly sum the scores from a list of PWB answers', () => {
		const answers: PWBAnswer[] = [
			{ question_id: 1, score: 5 },
			{ question_id: 2, score: 6 },
			{ question_id: 3, score: 4 },
			{ question_id: 4, score: 1 }
		];
		const expectedScore = 16;
		const result = calculatePWBScore(answers);
		expect(result).toBe(expectedScore);
	});

	it('should return 0 for an empty list of answers', () => {
		const answers: PWBAnswer[] = [];
		const expectedScore = 0;
		const result = calculatePWBScore(answers);
		expect(result).toBe(expectedScore);
	});
});