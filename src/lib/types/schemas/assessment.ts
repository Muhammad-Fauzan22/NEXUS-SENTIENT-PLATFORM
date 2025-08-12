// --- Skema Input & Data Mentah ---
// Mendefinisikan bentuk data yang dikumpulkan dari pengguna.

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

// Agregasi dari semua data input yang dikirim ke API.
export interface AssessmentData {
	user_data: UserData;
	riasec_answers: RIASECAnswer[];
	pwb_answers: PWBAnswer[];
}


// --- Skema Output & Hasil Analisis AI ---
// Mendefinisikan bentuk data terstruktur yang dihasilkan oleh layanan AI.

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

// Skema final untuk Individual Development Plan (IDP) yang dihasilkan.
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