<script lang="ts">
	import type { IStudentProfile } from '$lib/types/profile.ts';
	import Step1_PersonalInfo from '$lib/components/assessment/Step1_PersonalInfo.svelte';
	import Step2_Riasec from '$lib/components/assessment/Step2_Riasec.svelte';
	import Step3_BigFive from '$lib/components/assessment/Step3_BigFive.svelte';

	let currentStep = $state(1);
	let formData = $state<Partial<IStudentProfile>>({});

	function nextStep() {
		if (currentStep < 4) {
			currentStep++;y
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}
</script>

<main class="container mx-auto px-4 py-12">
	<h2 class="text-2xl font-bold mb-8">Assessment: Step {currentStep} of 4</h2>

	{#if currentStep === 1}
		<Step1_PersonalInfo formData={formData} />
	{:else if currentStep === 2}
		<Step2_Riasec formData={formData} />
	{:else if currentStep === 3}
		<Step3_BigFive formData={formData} />
	{:else if currentStep === 4}
		<div>Placeholder for Submission Review</div>
	{/if}

	<div class="mt-8 flex justify-between">
		<button 
			class="bg-secondary text-foreground px-6 py-2 rounded-md disabled:opacity-50"
			disabled={currentStep === 1}
			onclick={prevStep}
		>
			Previous
		</button>
		<button 
			class="bg-primary text-foreground px-6 py-2 rounded-md disabled:opacity-50"
			disabled={currentStep === 4}
			onclick={nextStep}
		>
			Next
		</button>
	</div>
</main>