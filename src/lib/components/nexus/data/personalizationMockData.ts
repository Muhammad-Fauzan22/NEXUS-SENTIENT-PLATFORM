import {
	PersonalizationType,
	LearningStyle,
	PersonalityType,
	AdaptationLevel,
	ContentDifficulty,
	UIComplexity
} from '../types/personalizationEnums';

// Data for global state store
export const mockStore = {
	personalizationSettings: {
		isEnabled: true,
		adaptationLevel: AdaptationLevel.EXTENSIVE as const,
		autoUpdate: true,
		learningAnalytics: true
	},
	userProfile: {
		id: 'user_12345' as const,
		assessmentCompleted: true,
		lastUpdated: '2025-01-15T10:30:00Z' as const,
		riasecProfile: {
			dominant: PersonalityType.INVESTIGATIVE as const,
			scores: {
				realistic: 65,
				investigative: 85,
				artistic: 72,
				social: 58,
				enterprising: 45,
				conventional: 38
			}
		},
		bigFiveProfile: {
			openness: 78,
			conscientiousness: 82,
			extraversion: 45,
			agreeableness: 71,
			neuroticism: 35
		},
		varkProfile: {
			dominant: LearningStyle.VISUAL as const,
			scores: {
				visual: 75,
				auditory: 45,
				reading: 68,
				kinesthetic: 52
			}
		}
	},
	adaptiveTheme: {
		primaryColor: '#6366f1' as const,
		accentColor: '#8b5cf6' as const,
		complexity: UIComplexity.ADVANCED as const,
		visualStyle: 'modern-minimalist' as const,
		animationLevel: 'moderate' as const
	}
};

// Data returned by API queries
export const mockQuery = {
	personalizationRecommendations: [
		{
			id: 'rec_001' as const,
			type: PersonalizationType.VISUAL as const,
			title: 'Enhanced Visual Elements' as const,
			description:
				'Based on your visual learning preference, we recommend more charts and diagrams' as const,
			confidence: 0.87,
			implemented: true
		},
		{
			id: 'rec_002' as const,
			type: PersonalizationType.CONTENT as const,
			title: 'Technical Content Focus' as const,
			description:
				'Your investigative personality suggests preference for detailed technical content' as const,
			confidence: 0.92,
			implemented: true
		},
		{
			id: 'rec_003' as const,
			type: PersonalizationType.LAYOUT as const,
			title: 'Structured Layout' as const,
			description:
				'High conscientiousness indicates preference for organized, structured interfaces' as const,
			confidence: 0.78,
			implemented: false
		}
	],
	adaptationMetrics: {
		engagementIncrease: 34.5,
		timeOnPage: 245,
		taskCompletionRate: 89.2,
		userSatisfaction: 4.6,
		adaptationAccuracy: 91.3
	},
	contentRecommendations: [
		{
			id: 'content_001' as const,
			title: 'Advanced Data Analysis Techniques' as const,
			difficulty: ContentDifficulty.ADVANCED as const,
			matchScore: 0.94,
			category: 'technical' as const,
			estimatedTime: 45
		},
		{
			id: 'content_002' as const,
			title: 'Visual Design Principles' as const,
			difficulty: ContentDifficulty.INTERMEDIATE as const,
			matchScore: 0.81,
			category: 'creative' as const,
			estimatedTime: 30
		}
	],
	personalityAnalytics: [
		{ trait: 'Realistic', score: 65, month: 'Jan' },
		{ trait: 'Investigative', score: 85, month: 'Feb' },
		{ trait: 'Artistic', score: 72, month: 'Mar' },
		{ trait: 'Social', score: 58, month: 'Apr' },
		{ trait: 'Enterprising', score: 45, month: 'May' },
		{ trait: 'Conventional', score: 38, month: 'Jun' }
	],
	learningStyleData: [
		{ style: 'Visual', score: 75, preference: 'High' },
		{ style: 'Auditory', score: 45, preference: 'Medium' },
		{ style: 'Reading', score: 68, preference: 'High' },
		{ style: 'Kinesthetic', score: 52, preference: 'Medium' }
	],
	adaptationHistory: [
		{ date: '2025-01-01', engagement: 65, satisfaction: 4.2 },
		{ date: '2025-01-05', engagement: 72, satisfaction: 4.4 },
		{ date: '2025-01-10', engagement: 78, satisfaction: 4.5 },
		{ date: '2025-01-15', engagement: 85, satisfaction: 4.6 }
	]
};

// Data passed as props to the root component
export const mockRootProps = {
	enablePersonalization: true,
	autoAdaptation: true,
	analyticsEnabled: true,
	debugMode: false
};
