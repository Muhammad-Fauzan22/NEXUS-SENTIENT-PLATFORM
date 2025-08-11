// This file will define the data structures for our application.

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