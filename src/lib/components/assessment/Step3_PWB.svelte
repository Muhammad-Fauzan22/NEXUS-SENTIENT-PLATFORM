<script lang="ts">
	import { assessmentStore } from '$lib/stores/assessmentStore';
	import type { PWBAnswer } from '$lib/types/schemas/assessment';
	import { pwbQuestions } from '$lib/data/raw/pwbQuestions';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let selections: Map<number, string> = new Map();

	function handleSubmit() {
		if (selections.size !== pwbQuestions.length) {
			alert('Please answer all questions before submitting.');
			return;
		}

		const formattedAnswers: PWBAnswer[] = [];
		for (const question of pwbQuestions) {
			let score = parseInt(selections.get(question.id) || '0', 10);
			if (question.reversed) {
				score = 7 - score; // Reverse score (1->6, 2->5, ..., 6->1)
			}
			formattedAnswers.push({ question_id: question.id, score });
		}

		assessmentStore.setPwbAnswers(formattedAnswers);
		assessmentStore.submitAssessment(); // Trigger the final submission
	}

	function goBack() {
		assessmentStore.goToStep(2);
	}
</script>

<Card>
	<h2 class="text-2xl font-bold text-gray-800 mb-2">Psychological Well-Being Scale</h2>
	<p class="text-gray-600 mb-6">
		Rate each statement on a scale of 1 to 6 based on how much you agree.
	</p>
	<div class="text-sm text-center text-gray-500 mb-6 p-2 bg-gray-50 rounded-md">
		1 = Strongly Disagree | 2 = Disagree | 3 = Slightly Disagree | 4 = Slightly Agree | 5 = Agree | 6
		= Strongly Agree
	</div>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div class="space-y-5 max-h-[50vh] overflow-y-auto pr-4">
			{#each pwbQuestions as question (question.id)}
				<fieldset class="border-t border-gray-200 pt-4">
					<legend class="text-md font-medium text-gray-700">{question.id}. {question.text}</legend>
					<div class="flex justify-around items-center mt-3">
						<!-- CORRECTED: Use square brackets for array iteration -->
						{#each [1, 2, 3, 4, 5, 6] as score}
							<label class="flex flex-col items-center cursor-pointer">
								<input
									type="radio"
									name="q{question.id}"
									value={score}
									class="radio radio-sm"
									on:change={() => selections.set(question.id, String(score))}
									required
								/>
								<span class="text-xs mt-1">{score}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			{/each}
		</div>

		<div class="flex justify-between pt-4">
			<Button on:click={goBack} variant="secondary">Back</Button>
			<Button type="submit" variant="primary">Submit & Generate My Plan</Button>
		</div>
	</form>
</Card>```