import { writable, derived } from 'svelte/store';
import { assessmentSchema, type AssessmentSubmission, type GeneratedIDP } from '$lib/types/schemas';
import { apiClient, ApiClientError } from '$lib/client/apiClient';

const TOTAL_STEPS = 3;
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

interface AssessmentState {
	currentStep: number;
	status: SubmissionStatus;
	error: string | null;
	data: AssessmentSubmission;
	result: GeneratedIDP | null;
}

function createAssessmentStore() {
	const initialState: AssessmentState = {
		currentStep: 1,
		status: 'idle',
		error: null,
		result: null,
		data: {
			portfolio_text: '',
			aspirations: '',
			riasec_scores: { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 },
			pwb_scores: {
				self_acceptance: 3,
				positive_relations: 3,
				autonomy: 3,
				environmental_mastery: 3,
				purpose_in_life: 3,
				personal_growth: 3
			}
		}
	};

	const store = writable<AssessmentState>(initialState);
	const { subscribe, update, set } = store;

	const validation = derived(store, ($store) => {
		return assessmentSchema.safeParse($store.data);
	});

	const methods = {
		nextStep: () =>
			update((s) => (s.currentStep < TOTAL_STEPS ? { ...s, currentStep: s.currentStep + 1 } : s)),
		prevStep: () =>
			update((s) => (s.currentStep > 1 ? { ...s, currentStep: s.currentStep - 1 } : s)),
		goToStep: (step: number) =>
			update((s) => (step > 0 && step <= TOTAL_STEPS ? { ...s, currentStep: step } : s)),

		submit: async () => {
			update((s) => ({ ...s, status: 'submitting', error: null }));

			let currentData: AssessmentSubmission;
			store.subscribe((s) => (currentData = s.data))();

			const validationResult = assessmentSchema.safeParse(currentData!);
			if (!validationResult.success) {
				update((s) => ({
					...s,
					status: 'error',
					error: 'Data tidak valid. Silakan periksa kembali isian Anda.'
				}));
				return;
			}

			try {
				const idpResult = await apiClient.post<GeneratedIDP>(
					'/api/assessment/submit',
					validationResult.data
				);
				update((s) => ({ ...s, status: 'success', result: idpResult }));
			} catch (err) {
				let errorMessage = 'Terjadi kesalahan yang tidak diketahui.';
				if (err instanceof ApiClientError) {
					errorMessage = err.response.error || err.message;
				} else if (err instanceof Error) {
					errorMessage = err.message;
				}
				update((s) => ({ ...s, status: 'error', error: errorMessage }));
			}
		},

		reset: () => set(initialState)
	};

	return {
		subscribe,
		...methods,
		validation
	};
}

export const assessmentStore = createAssessmentStore();
