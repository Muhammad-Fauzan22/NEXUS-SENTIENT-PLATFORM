import { writable } from 'svelte/store';
import type { UserData, RIASECAnswer, PWBAnswer, IDPResult } from '$lib/types/schemas/assessment';
import { apiClient } from '$lib/utils/apiClient';

// --- State Definition ---

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

export interface AssessmentState {
	currentStep: number;
	userData: UserData | null;
	riasecAnswers: RIASECAnswer[];
	pwbAnswers: PWBAnswer[];
	submission: {
		state: SubmissionState;
		error: string | null;
	};
	result: IDPResult | null;
}

const initialState: AssessmentState = {
	currentStep: 1,
	userData: null,
	riasecAnswers: [],
	pwbAnswers: [],
	submission: {
		state: 'idle',
		error: null
	},
	result: null
};

// --- Custom Store Logic ---

function createAssessmentStore() {
	const { subscribe, update, set } = writable<AssessmentState>(initialState);

	return {
		subscribe,

		setUserData: (data: UserData) => {
			update((state) => ({ ...state, userData: data, currentStep: 2 }));
		},

		setRiasecAnswers: (answers: RIASECAnswer[]) => {
			update((state) => ({ ...state, riasecAnswers: answers, currentStep: 3 }));
		},

		setPwbAnswers: (answers: PWBAnswer[]) => {
			update((state) => ({ ...state, pwbAnswers: answers }));
		},

		submitAssessment: async () => {
			let currentState: AssessmentState | undefined;
			const unsubscribe = subscribe(state => currentState = state);
			unsubscribe();

			if (!currentState || !currentState.userData || currentState.riasecAnswers.length === 0 || currentState.pwbAnswers.length === 0) {
				update(state => ({
					...state,
					submission: { state: 'error', error: 'Incomplete data. Cannot submit.' }
				}));
				return;
			}

			update(state => ({ ...state, submission: { state: 'loading', error: null } }));

			try {
				const payload = {
					user_data: currentState.userData,
					riasec_answers: currentState.riasecAnswers,
					pwb_answers: currentState.pwbAnswers
				};

				const response = await apiClient.post<{ success: boolean; submissionId: string; idp: IDPResult }>('/api/assessment/submit', payload);

				if (response.success) {
					update(state => ({
						...state,
						result: response.idp,
						submission: { state: 'success', error: null }
					}));
				} else {
					throw new Error('API indicated submission was not successful.');
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : 'An unknown error occurred.';
				update(state => ({
					...state,
					submission: { state: 'error', error: message }
				}));
			}
		},

		goToStep: (step: number) => {
			update((state) => ({ ...state, currentStep: step }));
		},

		reset: () => {
			set(initialState);
		}
	};
}

export const assessmentStore = createAssessmentStore();