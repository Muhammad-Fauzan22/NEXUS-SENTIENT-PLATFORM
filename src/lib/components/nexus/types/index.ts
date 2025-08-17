// Types and enums for NEXUS Living Interface

export enum DevelopmentPillar {
	ACADEMIC = 'academic',
	MANAGERIAL = 'managerial',
	LEADERSHIP = 'leadership',
	TECHNICAL = 'technical',
	SOCIAL = 'social'
}

export enum ConstellationElementType {
	CENTRAL_STAR = 'central_star',
	PLANET = 'planet',
	MOON = 'moon',
	NEBULA = 'nebula',
	CONNECTION = 'connection'
}

export enum AssessmentInputType {
	SCALE = 'scale',
	MULTIPLE_CHOICE = 'multiple_choice',
	TEXT = 'text',
	CRYSTAL_SELECT = 'crystal_select'
}

export enum EmotionalState {
	STRESSED = 'stressed',
	ENTHUSIASTIC = 'enthusiastic',
	CALM = 'calm',
	ANXIOUS = 'anxious',
	CONFIDENT = 'confident'
}

export enum AnimationSpeed {
	SLOW = 'slow',
	NORMAL = 'normal',
	FAST = 'fast'
}

// Interface definitions
export interface OracleGateProps {
	onEnter: () => void;
	isActive: boolean;
}

export interface ChatAssessmentProps {
	questions: AssessmentQuestion[];
	onResponse: (questionId: number, response: any) => void;
	emotionalState: EmotionalState;
	currentQuestion: number;
}

export interface ConstellationProps {
	userProgress: UserProgress;
	developmentPillars: DevelopmentPillar[];
	activities: Activity[];
	hiddenOpportunities: HiddenOpportunity[];
	onElementClick: (elementId: string) => void;
}

export interface AssessmentQuestion {
	id: number;
	text: string;
	type: AssessmentInputType;
	pillar: DevelopmentPillar;
	options?: string[];
}

export interface UserProgress {
	overallProgress: number;
	pillarProgress: Record<DevelopmentPillar, number>;
	completedActivities: string[];
}

export interface Activity {
	id: string;
	title: string;
	pillar: DevelopmentPillar;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	estimatedTime: string;
	kpiMetrics: string[];
}

export interface HiddenOpportunity {
	id: string;
	connection: string[];
	description: string;
	impact: 'low' | 'medium' | 'high';
}

export interface UserState {
	id: string;
	name: string;
	currentSemester: number;
	emotionalState: EmotionalState;
	constellationProgress: number;
}

export interface AssessmentState {
	isCompleted: boolean;
	currentQuestion: number;
	totalQuestions: number;
	responses: AssessmentResponse[];
}

export interface AssessmentResponse {
	questionId: number;
	response: any;
	timestamp: Date;
}

export interface ConstellationState {
	centralStar: StarElement;
	planets: PlanetElement[];
	moons: MoonElement[];
	connections: ConnectionElement[];
}

export interface StarElement {
	brightness: number;
	pulsing: boolean;
}

export interface PlanetElement {
	id: string;
	pillar: DevelopmentPillar;
	progress: number;
	color: string;
	position: { x: number; y: number; z: number };
}

export interface MoonElement {
	id: string;
	parentPlanet: string;
	activity: Activity;
	brightness: number;
	position: { x: number; y: number; z: number };
}

export interface ConnectionElement {
	id: string;
	from: string;
	to: string;
	strength: number;
	opportunity: HiddenOpportunity;
}

export interface NexusAppProps {
	initialView?: 'oracle-gate' | 'assessment' | 'constellation' | 'dashboard';
	theme?: 'dark' | 'light';
	enableAudio?: boolean;
	enableProactiveNotifications?: boolean;
	enableEmpatheticUI?: boolean;
	enable3DConstellation?: boolean;
	websocketUrl?: string;
	reconnectAttempts?: number;
	userId?: string;
	sessionId?: string;
	animationQuality?: 'low' | 'medium' | 'high';
	renderQuality?: 'low' | 'medium' | 'high';
	onAssessmentComplete?: (results: any) => void;
	onConstellationInteraction?: (elementId: string, action: string) => void;
	onEmotionalStateChange?: (state: EmotionalState) => void;
	onProgressUpdate?: (pillar: string, progress: number) => void;
	debugMode?: boolean;
	showPerformanceMetrics?: boolean;
}
