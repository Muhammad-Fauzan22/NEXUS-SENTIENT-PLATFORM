import { writable } from 'svelte/store';
import type { UserData, RIASECAnswer, PWBAnswer, IDPResult } from '$lib/types/schemas/assessment';
import { apiClient } from '$lib/utils/apiClient';

// --- Definisi Bentuk State ---

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

// --- State Awal ---

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

// --- Logika Custom Store ---

function createAssessmentStore() {
	const { subscribe, update, set } = writable<AssessmentState>(initialState);

	return {
		subscribe,

		// Aksi untuk menyimpan data pengguna dan maju ke langkah berikutnya
		setUserData: (data: UserData) => {
			update((state) => ({ ...state, userData: data, currentStep: 2 }));
		},

		// Aksi untuk menyimpan jawaban RIASEC dan maju ke langkah berikutnya
		setRiasecAnswers: (answers: RIASECAnswer[]) => {
			update((state) => ({ ...state, riasecAnswers: answers, currentStep: 3 }));
		},

		// Aksi untuk menyimpan jawaban PWB (tanpa maju, karena ini langkah terakhir)
		setPwbAnswers: (answers: PWBAnswer[]) => {
			update((state) => ({ ...state, pwbAnswers: answers }));
		},

		// Aksi utama untuk mengirimkan asesmen ke backend
		submitAssessment: async () => {
			let currentState: AssessmentState | undefined;
			const unsubscribe = subscribe(state => currentState = state);
			unsubscribe(); // Langsung unsubscribe agar tidak terjadi memory leak

			if (!currentState?.userData || !currentState.riasecAnswers.length || !currentState.pwbAnswers.length) {
				update(state => ({
					...state,
					submission: { state: 'error', error: 'Incomplete assessment data. Cannot submit.' }
				}));
				return;
			}

			// Set state ke 'loading' untuk memicu UI pemuatan
			update(state => ({ ...state, submission: { state: 'loading', error: null } }));

			try {
				const payload = {
					user_data: currentState.userData,
					riasec_answers: currentState.riasecAnswers,
					pwb_answers: currentState.pwbAnswers
				};

				const response = await apiClient.post<{ success: boolean; submissionId: string; idp: IDPResult }>('/api/assessment/submit', payload);

				if (response.success) {
					// Jika berhasil, simpan hasil dan set state ke 'success'
					update(state => ({
						...state,
						result: response.idp,
						submission: { state: 'success', error: null }
					}));
				} else {
					throw new Error('API response indicated submission was not successful.');
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : 'An unknown error occurred during submission.';
				// Jika gagal, simpan pesan error dan set state ke 'error'
				update(state => ({
					...state,
					submission: { state: 'error', error: message }
				}));
			}
		},

		// Aksi untuk navigasi manual antar langkah (misalnya, tombol "Back")
		goToStep: (step: number) => {
			update((state) => ({ ...state, currentStep: step }));
		},

		// Aksi untuk mereset seluruh state ke kondisi awal
		reset: () => {
			set(initialState);
		}
	};
}

export const assessmentStore = createAssessmentStore();