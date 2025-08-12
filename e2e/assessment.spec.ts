import { describe, it, expect } from 'vitest';
import type { PWBAnswer } from '$lib/types/schemas/assessment';
// CORRECTED: Only import what is necessary for this unit test.
import { calculatePWBScore } from './pwbAnalyzer';

describe('pwbAnalyzer Logic', () => {
	it('should correctly sum the scores from a list of PWB answers', () => {
		const answers: PWBAnswer[] = [
			{ question_id: 1, score: 5 },
			{ question_id: 2, score: 6 },
			{ question_id: 3, score: 4 },
			{ question_id: 4, score: 1 }
		];

		const expectedScore = 16; // 5 + 6 + 4 + 1
		const result = calculatePWBScore(answers);
		expect(result).toBe(expectedScore);
	});

	it('should return 0 for an empty list of answers', () => {
		const answers: PWBAnswer[] = [];
		const expectedScore = 0;
		const result = calculatePWBScore(answers);
		expect(result).toBe(expectedScore);
	});

	it('should handle scores of zero correctly', () => {
		const answers: PWBAnswer[] = [
			{ question_id: 1, score: 5 },
			{ question_id: 2, score: 0 },
			{ question_id: 3, score: 3 }
		];
		const expectedScore = 8;
		const result = calculatePWBScore(answers);
		expect(result).toBe(expectedScore);
	});

	it('should calculate a full scale of answers correctly', () => {
		const answers: PWBAnswer[] = [
			{ question_id: 1, score: 6 },
			{ question_id: 2, score: 6 },
			{ question_id: 3, score: 6 },
			{ question_id: 4, score: 6 },
			{ question_id: 5, score: 6 },
			{ question_id: 6, score: 6 },
			{ question_id: 7, score: 6 },
			{ question_id: 8, score: 6 },
			{ question_id: 9, score: 6 },
			{ question_id: 10, score: 6 },
			{ question_id: 11, score: 6 },
			{ question_id: 12, score: 6 },
			{ question_id: 13, score: 6 },
			{ question_id: 14, score: 6 }
		];
		const expectedScore = 84; // 14 * 6
		const result = calculatePWBScore(answers);
		expect(result).toBe(expectedScore);
	});
});