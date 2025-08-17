// Mock data for NEXUS platform
export enum AssessmentStage {
	INTRODUCTION = 'introduction',
	PERSONAL = 'personal',
	ACADEMIC = 'academic',
	PSYCHOMETRIC = 'psychometric',
	REVIEW = 'review',
	COMPLETE = 'complete'
}

export enum MessageSender {
	AI = 'ai',
	USER = 'user',
	SYSTEM = 'system'
}

export enum UITheme {
	CALM = 'calm',
	ENERGETIC = 'energetic',
	FOCUSED = 'focused',
	STRESSED = 'stressed',
	NEUTRAL = 'neutral'
}

export enum AnimationSpeed {
	SLOW = 'slow',
	NORMAL = 'normal',
	FAST = 'fast'
}

export enum ConstellationElementType {
	PLANET = 'planet',
	MOON = 'moon',
	STAR = 'star',
	CONNECTION = 'connection'
}

export enum DevelopmentPillar {
	ACADEMIC = 'academic',
	PROFESSIONAL = 'professional',
	PERSONAL = 'personal',
	SOCIAL = 'social',
	CREATIVE = 'creative',
	LEADERSHIP = 'leadership'
}

// Mock data for global state store
export const mockStore = {
	currentTheme: UITheme.NEUTRAL as const,
	animationSpeed: 'normal' as const,
	isConnected: true,
	assessmentStage: AssessmentStage.INTRODUCTION as const,
	user: {
		id: 'user-123',
		name: 'Alex Chen',
		email: 'alex.chen@university.edu'
	}
};

// Mock data for API responses
export const mockQuery = {
	chatMessages: [
		{
			id: 'msg-1',
			sender: MessageSender.AI as const,
			content:
				"Hello! I'm NEXUS, your AI development companion. I'm here to help you discover your potential and create a personalized development plan. Are you ready to begin this journey of self-discovery?",
			timestamp: '2024-01-15T10:00:00Z'
		},
		{
			id: 'msg-2',
			sender: MessageSender.USER as const,
			content: "Yes, I'm excited to start!",
			timestamp: '2024-01-15T10:01:00Z'
		},
		{
			id: 'msg-3',
			sender: MessageSender.AI as const,
			content:
				"Wonderful! Let's start with understanding your academic background. What is your current field of study?",
			timestamp: '2024-01-15T10:01:30Z'
		}
	],
	idpData: {
		id: 'idp-456',
		userId: 'user-123',
		linkedinSummary:
			'Aspiring Computer Science graduate with strong analytical skills and passion for AI/ML. Demonstrated leadership in academic projects and community initiatives. Seeking opportunities to apply technical knowledge in innovative software development roles.',
		analysisResults: {
			personalityType: 'INTJ-A',
			strengthsProfile: [
				'Analytical Thinking',
				'Problem Solving',
				'Strategic Planning',
				'Independent Learning'
			],
			developmentAreas: [
				'Public Speaking',
				'Team Collaboration',
				'Emotional Intelligence',
				'Networking'
			]
		},
		roadmap: [
			{
				semester: 1,
				pillar: DevelopmentPillar.ACADEMIC as const,
				goals: ['Complete Advanced Algorithms course', 'Maintain GPA above 3.7'],
				recommendations: [
					'Join study groups',
					'Attend professor office hours',
					'Practice coding daily'
				]
			},
			{
				semester: 2,
				pillar: DevelopmentPillar.PROFESSIONAL as const,
				goals: ['Secure internship application', 'Build portfolio projects'],
				recommendations: [
					'Update LinkedIn profile',
					'Create GitHub portfolio',
					'Practice technical interviews'
				]
			},
			{
				semester: 3,
				pillar: DevelopmentPillar.PERSONAL as const,
				goals: ['Improve public speaking', 'Develop leadership skills'],
				recommendations: [
					'Join Toastmasters',
					'Lead a student organization',
					'Take communication workshop'
				]
			},
			{
				semester: 4,
				pillar: DevelopmentPillar.SOCIAL as const,
				goals: ['Expand professional network', 'Mentor junior students'],
				recommendations: [
					'Attend tech meetups',
					'Join professional associations',
					'Volunteer as tutor'
				]
			}
		],
		constellationData: [
			{
				id: 'planet-academic',
				type: ConstellationElementType.PLANET as const,
				pillar: DevelopmentPillar.ACADEMIC as const,
				position: { x: 0, y: 0, z: 0 },
				size: 1.5,
				color: '#3b82f6',
				moons: [
					{
						id: 'moon-algorithms',
						type: ConstellationElementType.MOON as const,
						name: 'Advanced Algorithms',
						position: { x: 2, y: 0, z: 0 },
						size: 0.3,
						color: '#60a5fa'
					}
				]
			},
			{
				id: 'planet-professional',
				type: ConstellationElementType.PLANET as const,
				pillar: DevelopmentPillar.PROFESSIONAL as const,
				position: { x: 5, y: 0, z: 0 },
				size: 1.2,
				color: '#10b981',
				moons: [
					{
						id: 'moon-internship',
						type: ConstellationElementType.MOON as const,
						name: 'Internship Prep',
						position: { x: 7, y: 0, z: 0 },
						size: 0.25,
						color: '#34d399'
					}
				]
			}
		]
	}
};

// Mock data for component props
export const mockRootProps = {
	welcomePage: {
		isFirstVisit: true,
		hasCompletedAssessment: false
	},
	assessmentInterface: {
		websocketUrl: 'wss://nexus-backend.replit.app/ws/assessment',
		currentStage: AssessmentStage.INTRODUCTION as const,
		messages: mockQuery.chatMessages
	},
	constellationDashboard: {
		idpId: 'idp-456',
		idpData: mockQuery.idpData,
		canvasWidth: 800,
		canvasHeight: 600
	},
	roadmapTimeline: {
		roadmapData: mockQuery.idpData.roadmap,
		currentSemester: 1
	}
};
