<script lang="ts">
	import type { IStudentProfile } from '$lib/types/profile.ts';
	import Step1_PersonalInfo from '$lib/components/assessment/Step1_PersonalInfo.svelte';
	import Step2_Riasec from '$lib/components/assessment/Step2_Riasec.svelte';
	import Step3_BigFive from '$lib/components/assessment/Step3_BigFive.svelte';
	import Step4_Review from '$lib/components/assessment/Step4_Review.svelte';

	let currentStep = $state(1);
	let formData = $state<Partial<IStudentProfile>>({});
	let isLoading = $state(false);
	let submissionStatus = $state<'success' | 'error' | null>(null);
	let serverMessage = $state('');

	async function handleSubmit() {
		isLoading = true;
		submissionStatus = null;

		try {
			const response = await fetch('/api/assessment/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const result = await response.json();
			submissionStatus = 'success';
			serverMessage = result.message || 'Assessment submitted successfully!';
		} catch (error) {
			submissionStatus = 'error';
			serverMessage = 'An error occurred. Please try again.';
			console.error('Submission error:', error);
		} finally {
			isLoading = false;
		}
	}

	function nextStep() {
		if (currentStep < 4) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}
</script>

{#if submissionStatus}
	<main class="container mx-auto px-4 py-12">
		<div class="max-w-2xl mx-auto text-center">
			{#if submissionStatus === 'success'}
				<div class="bg-green-900/30 border border-green-800 rounded-md p-6">
					<h2 class="text-2xl font-bold text-green-400 mb-4">Success!</h2>
					<p class="text-green-300">{serverMessage}</p>
					<p class="text-green-300/80 mt-4">
						Your Individual Development Plan will be generated shortly.
					</p>
				</div>
			{:else if submissionStatus === 'error'}
				<div class="bg-red-900/30 border border-red-800 rounded-md p-6">
					<h2 class="text-2xl font-bold text-red-400 mb-4">Submission Failed</h2>
					<p class="text-red-300">{serverMessage}</p>
					<button
						onclick={() => {
							submissionStatus = null;
						}}
						class="mt-6 bg-primary text-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
					>
						Try Again
					</button>
				</div>
			{/if}
		</div>
	</main>
{:else}
	<main class="container mx-auto px-4 py-12">
		<h2 class="text-2xl font-bold mb-8">Assessment: Step {currentStep} of 4</h2>

		{#if currentStep === 1}
			<Step1_PersonalInfo {formData} />
		{:else if currentStep === 2}
			<Step2_Riasec {formData} />
		{:else if currentStep === 3}
			<Step3_BigFive {formData} />
		{:else if currentStep === 4}
			<Step4_Review {formData} />
		{/if}

		<div class="mt-8 flex justify-between">
			<button
				class="bg-secondary text-foreground px-6 py-2 rounded-md disabled:opacity-50"
				disabled={currentStep === 1}
				onclick={prevStep}
			>
				Previous
			</button>
			<div class="flex gap-2">
				{#if currentStep === 4}
					<button
						onclick={handleSubmit}
						disabled={isLoading}
						class="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
					>
						{#if isLoading}
							Submitting...
						{:else}
							Submit Assessment
						{/if}
					</button>
				{/if}
				<button
					class="bg-primary text-foreground px-6 py-2 rounded-md disabled:opacity-50"
					disabled={currentStep === 4}
					onclick={nextStep}
				>
					Next
				</button>
			</div>
		</div>
	</main>
{/if}
