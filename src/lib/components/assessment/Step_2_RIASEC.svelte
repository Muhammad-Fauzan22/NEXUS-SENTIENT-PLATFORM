<script lang="ts">
	import { assessmentStore } from '$lib/stores/assessmentStore';
	import type { RIASECAnswer } from '$lib/types/schemas/assessment';
	import { riasecQuestions } from '$lib/data/raw/riasecQuestions';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	// Menggunakan objek untuk state jawaban memberikan performa yang lebih baik
	// untuk pencarian dan pembaruan dibandingkan dengan array, terutama untuk daftar yang panjang.
	let answers: { [key: number]: 'yes' | 'no' } = {};

	function handleSubmit() {
		// Validasi untuk memastikan semua pertanyaan telah dijawab.
		if (Object.keys(answers).length !== riasecQuestions.length) {
			alert('Please answer all questions before continuing.');
			return;
		}

		// Mengubah format state lokal menjadi format yang diharapkan oleh store dan API.
		const formattedAnswers: RIASECAnswer[] = Object.entries(answers).map(([id, answer]) => ({
			question_id: parseInt(id, 10),
			answer: answer
		}));

		assessmentStore.setRiasecAnswers(formattedAnswers);
	}
</script>

<Card>
	<h2 class="text-2xl font-bold text-gray-800 mb-2">RIASEC Assessment</h2>
	<p class="text-gray-600 mb-6">
		For each statement, choose whether you agree ("Yes") or disagree ("No"). This helps understand
		your career interests.
	</p>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- Container yang dapat di-scroll untuk daftar pertanyaan yang panjang -->
		<div class="space-y-4 max-h-[50vh] overflow-y-auto pr-4">
			{#each riasecQuestions as question (question.id)}
				<fieldset class="border-t border-gray-200 pt-4">
					<legend class="text-md font-medium text-gray-700">{question.id}. {question.text}</legend>
					<div class="flex items-center space-x-4 mt-2">
						<label class="flex items-center cursor-pointer">
							<input
								type="radio"
								name="q{question.id}"
								value="yes"
								class="radio radio-primary"
								bind:group={answers[question.id]}
								required
							/>
							<span class="ml-2">Yes</span>
						</label>
						<label class="flex items-center cursor-pointer">
							<input
								type="radio"
								name="q{question.id}"
								value="no"
								class="radio"
								bind:group={answers[question.id]}
								required
							/>
							<span class="ml-2">No</span>
						</label>
					</div>
				</fieldset>
			{/each}
		</div>

		<div class="flex justify-between pt-4">
			<Button on:click={() => assessmentStore.goToStep(1)} variant="secondary">Back</Button>
			<Button type="submit" variant="primary">Continue to PWB Assessment</Button>
		</div>
	</form>
</Card>