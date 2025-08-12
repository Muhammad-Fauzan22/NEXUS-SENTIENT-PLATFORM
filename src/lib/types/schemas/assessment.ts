// --- Input & Raw Data Schemas ---

export interface PWBAnswer {
	question_id: number;
	score: number;
}

export interface RIASECAnswer {
	question_id: number;
	answer: 'yes' | 'no';
}

export interface UserData {
	name: string;
	email: string;
	age: number;
	occupation: string;
}

export interface AssessmentData {
	user_data: UserData;
	riasec_answers: RIASECAnswer[];
	pwb_answers: PWBAnswer[];
}

// --- AI Analysis & Output Schemas ---

export interface PWBAnalysisResult {
	totalScore: number;
	level: 'Low' | 'Moderate' | 'High';
	interpretation: string;
	recommendations: string[];
}

export interface RIASECAnalysisResult {
	topCode: string;
	summary: string;
	keywords: string[];
	careers: string[];
}

export interface ActionItem {
	title: string;
	description: string;
	rationale: string;
}

export interface IDPResult {
	title: string;
	introduction: string;
	strengthsAnalysis: {
		summary: string;
		points: string[];
	};
	growthAreas: {
		summary: string;
		points: string[];
	};
	actionPlan: {
		strengths: ActionItem[];
		growth: ActionItem[];
	};
}