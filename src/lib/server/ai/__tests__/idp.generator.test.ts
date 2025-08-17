import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateIdp } from '../idp.generator';
import type { Database } from '$lib/types/database.types';

// Mock dependencies
vi.mock('$lib/server/utils/logger', () => ({
	logger: {
		child: vi.fn(() => ({
			info: vi.fn(),
			debug: vi.fn(),
			error: vi.fn(),
			warn: vi.fn()
		})),
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
		warn: vi.fn()
	}
}));

vi.mock('$lib/server/utils/performance', () => ({
	performanceMonitor: {
		timeAsync: vi.fn((name, fn) => fn()),
		timeSync: vi.fn((name, fn) => fn())
	}
}));

vi.mock('$lib/server/ai/rag', () => ({
	retrieveContext: vi.fn()
}));

vi.mock('$lib/server/ai/promptBuilder', () => ({
	buildAssessmentPrompt: vi.fn()
}));

vi.mock('$lib/server/services/ai.manager', () => ({
	aiManager: {
		executeTask: vi.fn()
	}
}));

type StructuredProfile = Database['public']['Tables']['processed_profiles']['Row'];

describe('IDP Generator', () => {
	const mockProfile: StructuredProfile = {
		id: 'test-profile-id',
		created_at: '2024-01-01T00:00:00Z',
		aspirations: 'Saya ingin menjadi software engineer',
		portfolio_text: 'Pengalaman dalam web development',
		riasec_scores: {
			realistic: 3,
			investigative: 5,
			artistic: 2,
			social: 4,
			enterprising: 3,
			conventional: 2
		},
		pwb_scores: {
			autonomy: 4,
			environmental_mastery: 5,
			personal_growth: 5,
			positive_relations: 4,
			purpose_in_life: 5,
			self_acceptance: 4
		},
		user_id: 'test-user-id',
		full_name: 'Test User',
		email: 'test@example.com',
		student_id: '12345',
		status: 'processed'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should generate IDP successfully with valid input', async () => {
		// Arrange
		const { retrieveContext } = await import('$lib/server/ai/rag');
		const { buildAssessmentPrompt } = await import('$lib/server/ai/promptBuilder');
		const { aiManager } = await import('$lib/server/services/ai.manager');

		vi.mocked(retrieveContext).mockResolvedValue([
			{ id: '1', content_text: 'Test context', similarity: 0.8 }
		]);
		vi.mocked(buildAssessmentPrompt).mockReturnValue('Test prompt');
		vi.mocked(aiManager.executeTask).mockResolvedValue(
			JSON.stringify({
				linkedin_summary: 'Test summary',
				potential_analysis: 'Test analysis',
				career_goals_analysis: 'Test goals',
				roadmap: [
					{
						semester: 1,
						theme: 'Foundation',
						academic: {
							focus: 'Programming basics',
							courses: ['CS101'],
							knowledge: 'Programming fundamentals',
							skills: 'Coding',
							attitude: 'Curious',
							kpis: ['Complete CS101']
						},
						non_academic: {
							focus: 'Networking',
							development_programs: ['Coding bootcamp'],
							clubs: ['Programming club'],
							mentors: ['Senior developer'],
							knowledge: 'Industry trends',
							skills: 'Communication',
							attitude: 'Collaborative',
							kpis: ['Join programming club']
						}
					}
				]
			})
		);

		// Act
		const result = await generateIdp(mockProfile);

		// Assert
		expect(result).toBeDefined();
		expect(result.linkedin_summary).toBe('Test summary');
		expect(result.roadmap).toHaveLength(1);
		expect(result.roadmap[0].semester).toBe(1);
		expect(retrieveContext).toHaveBeenCalledWith(
			'Saya ingin menjadi software engineer. Pengalaman dalam web development'
		);
		expect(buildAssessmentPrompt).toHaveBeenCalled();
		expect(aiManager.executeTask).toHaveBeenCalledWith('GENERATE_DRAFT', 'Test prompt');
	});

	it('should handle invalid JSON response from AI', async () => {
		// Arrange
		const { retrieveContext } = await import('$lib/server/ai/rag');
		const { buildAssessmentPrompt } = await import('$lib/server/ai/promptBuilder');
		const { aiManager } = await import('$lib/server/services/ai.manager');

		vi.mocked(retrieveContext).mockResolvedValue([]);
		vi.mocked(buildAssessmentPrompt).mockReturnValue('Test prompt');
		vi.mocked(aiManager.executeTask).mockResolvedValue('Invalid JSON response');

		// Act & Assert
		await expect(generateIdp(mockProfile)).rejects.toThrow();
	});

	it('should handle schema validation failure', async () => {
		// Arrange
		const { retrieveContext } = await import('$lib/server/ai/rag');
		const { buildAssessmentPrompt } = await import('$lib/server/ai/promptBuilder');
		const { aiManager } = await import('$lib/server/services/ai.manager');

		vi.mocked(retrieveContext).mockResolvedValue([]);
		vi.mocked(buildAssessmentPrompt).mockReturnValue('Test prompt');
		vi.mocked(aiManager.executeTask).mockResolvedValue(
			JSON.stringify({
				// Invalid types to force schema validation failure
				linkedin_summary: 123,
				roadmap: 'not-array'
			})
		);

		// Act & Assert
		await expect(generateIdp(mockProfile)).rejects.toThrow();
	});

	it('should handle RAG retrieval failure gracefully', async () => {
		// Arrange
		const { retrieveContext } = await import('$lib/server/ai/rag');
		const { buildAssessmentPrompt } = await import('$lib/server/ai/promptBuilder');
		const { aiManager } = await import('$lib/server/services/ai.manager');

		vi.mocked(retrieveContext).mockRejectedValue(new Error('RAG failure'));
		vi.mocked(buildAssessmentPrompt).mockReturnValue('Test prompt');
		vi.mocked(aiManager.executeTask).mockResolvedValue(
			JSON.stringify({
				linkedin_summary: 'Test summary',
				potential_analysis: 'Test analysis',
				career_goals_analysis: 'Test goals',
				roadmap: []
			})
		);

		// Act & Assert
		await expect(generateIdp(mockProfile)).rejects.toThrow();
	});
});
