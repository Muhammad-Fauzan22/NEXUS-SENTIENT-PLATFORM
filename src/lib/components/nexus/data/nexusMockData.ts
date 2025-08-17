// Mock data for NEXUS Living Interface
import { DevelopmentPillar, AssessmentInputType } from '../types';

// Data for global state store
export const mockStore = {
	user: {
		id: 'user_001' as const,
		name: 'Alex Chen' as const,
		currentSemester: 4 as const,
		emotionalState: 'calm' as const,
		constellationProgress: 0.65 as const
	},
	assessment: {
		isCompleted: false as const,
		currentQuestion: 1 as const,
		totalQuestions: 25 as const,
		responses: [] as const
	},
	constellation: {
		centralStar: {
			brightness: 0.8 as const,
			pulsing: true as const
		},
		planets: [
			{
				id: 'academic' as const,
				pillar: DevelopmentPillar.ACADEMIC,
				progress: 0.7 as const,
				color: '#4A90E2' as const,
				position: { x: 100, y: 0, z: 0 }
			},
			{
				id: 'managerial' as const,
				pillar: DevelopmentPillar.MANAGERIAL,
				progress: 0.5 as const,
				color: '#50C878' as const,
				position: { x: 0, y: 100, z: 0 }
			},
			{
				id: 'leadership' as const,
				pillar: DevelopmentPillar.LEADERSHIP,
				progress: 0.6 as const,
				color: '#FFD93D' as const,
				position: { x: -100, y: 0, z: 0 }
			},
			{
				id: 'technical' as const,
				pillar: DevelopmentPillar.TECHNICAL,
				progress: 0.8 as const,
				color: '#FF6B6B' as const,
				position: { x: 0, y: -100, z: 0 }
			},
			{
				id: 'social' as const,
				pillar: DevelopmentPillar.SOCIAL,
				progress: 0.4 as const,
				color: '#6BCFFF' as const,
				position: { x: 70, y: 70, z: 0 }
			}
		],
		moons: [
			{
				id: 'lkmm_td' as const,
				parentPlanet: 'leadership' as const,
				activity: {
					id: 'lkmm_td' as const,
					title: 'LKMM TD' as const,
					pillar: DevelopmentPillar.LEADERSHIP,
					difficulty: 'intermediate' as const,
					estimatedTime: '2 minggu' as const,
					kpiMetrics: ['Leadership score', 'Team collaboration']
				},
				brightness: 0.6 as const,
				position: { x: -120, y: 20, z: 0 }
			},
			{
				id: 'pkm_project' as const,
				parentPlanet: 'academic' as const,
				activity: {
					id: 'pkm_project' as const,
					title: 'Mulai Proyek PKM' as const,
					pillar: DevelopmentPillar.ACADEMIC,
					difficulty: 'advanced' as const,
					estimatedTime: '1 semester' as const,
					kpiMetrics: ['Research output', 'Innovation index']
				},
				brightness: 0.8 as const,
				position: { x: 120, y: 20, z: 0 }
			}
		],
		connections: [
			{
				id: 'robotics_debate' as const,
				from: 'technical' as const,
				to: 'social' as const,
				strength: 0.7 as const,
				opportunity: {
					id: 'robotics_debate' as const,
					connection: ['Tim Robotika', 'UKM Debat'] as const,
					description: 'Kombinasi technical skills dan public speaking' as const,
					impact: 'high' as const
				}
			}
		]
	}
};

// Data returned by API queries
export const mockQuery = {
	assessmentQuestions: [
		{
			id: 1 as const,
			text: 'Bagaimana tingkat kepercayaan diri Anda dalam memimpin tim?' as const,
			type: AssessmentInputType.SCALE,
			pillar: DevelopmentPillar.LEADERSHIP
		},
		{
			id: 2 as const,
			text: 'Pilih area yang paling ingin Anda kembangkan:' as const,
			type: AssessmentInputType.CRYSTAL_SELECT,
			pillar: DevelopmentPillar.ACADEMIC,
			options: ['Komunikasi', 'Analisis Data', 'Kreativitas'] as const
		},
		{
			id: 3 as const,
			text: 'Seberapa nyaman Anda dengan teknologi baru?' as const,
			type: AssessmentInputType.SCALE,
			pillar: DevelopmentPillar.TECHNICAL
		},
		{
			id: 4 as const,
			text: 'Bagaimana Anda mengatasi konflik dalam tim?' as const,
			type: AssessmentInputType.MULTIPLE_CHOICE,
			pillar: DevelopmentPillar.SOCIAL,
			options: [
				'Mediasi langsung',
				'Diskusi terbuka',
				'Konsultasi mentor',
				'Pendekatan individual'
			] as const
		}
	],
	developmentActivities: [
		{
			id: 'lkmm_td' as const,
			title: 'LKMM TD' as const,
			pillar: DevelopmentPillar.LEADERSHIP,
			difficulty: 'intermediate' as const,
			estimatedTime: '2 minggu' as const,
			kpiMetrics: ['Leadership assessment score', 'Team collaboration rating']
		},
		{
			id: 'pkm_project' as const,
			title: 'Mulai Proyek PKM' as const,
			pillar: DevelopmentPillar.ACADEMIC,
			difficulty: 'advanced' as const,
			estimatedTime: '1 semester' as const,
			kpiMetrics: ['Research proposal completion', 'Innovation metrics']
		},
		{
			id: 'robotics_competition' as const,
			title: 'Tim Robotika' as const,
			pillar: DevelopmentPillar.TECHNICAL,
			difficulty: 'advanced' as const,
			estimatedTime: '6 bulan' as const,
			kpiMetrics: ['Technical skill assessment', 'Project completion rate']
		},
		{
			id: 'debate_club' as const,
			title: 'UKM Debat' as const,
			pillar: DevelopmentPillar.SOCIAL,
			difficulty: 'intermediate' as const,
			estimatedTime: '3 bulan' as const,
			kpiMetrics: ['Public speaking score', 'Argumentation skills']
		}
	],
	hiddenOpportunities: [
		{
			id: 'robotics_debate' as const,
			connection: ['Tim Robotika', 'UKM Debat'] as const,
			description: 'Kombinasi technical skills dan public speaking untuk tech evangelism' as const,
			impact: 'high' as const
		},
		{
			id: 'academic_leadership' as const,
			connection: ['Proyek PKM', 'LKMM TD'] as const,
			description: 'Research leadership dan project management skills' as const,
			impact: 'medium' as const
		}
	]
};

// Data passed as props to the root component
export const mockRootProps = {
	initialView: 'oracle-gate' as const,
	theme: 'dark' as const,
	enableAudio: true as const,
	enableProactiveNotifications: true as const,
	websocketUrl: 'wss://nexus-api.example.com/ws' as const
};
