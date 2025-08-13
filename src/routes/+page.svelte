<script lang="ts">
	import { writable } from 'svelte/store';
	import Step1_Personal from '$lib/components/idp-form/Step1_Personal.svelte';
	import Step2_Academic from '$lib/components/idp-form/Step2_Academic.svelte';
	import Step3_Psychometric from '$lib/components/idp-form/Step3_Psychometric.svelte';
	import Step4_Review from '$lib/components/idp-form/Step4_Review.svelte';

	const currentStep = writable(1);
	const formData = writable({});

	function nextStep() {
		currentStep.update(n => n + 1);
	}

	function prevStep() {
		currentStep.update(n => n - 1);
	}
</script>

<div class="max-w-4xl mx-auto">
	<h1 class="text-3xl font-bold text-center mb-4">Individual Development Plan Generator</h1>
	<p class="text-center text-foreground/80 mb-8">
		Complete the following steps to generate your personalized development plan.
	</p>

	<div class="bg-secondary/30 p-8 rounded-lg shadow-md mt-8">
		{#if $currentStep === 1}
			<Step1_Personal bind:formData={$formData} />
		{:else if $currentStep === 2}
			<Step2_Academic bind:formData={$formData} />
		{:else if $currentStep === 3}
			<Step3_Psychometric bind:formData={$formData} />
		{:else if $currentStep === 4}
			<Step4_Review {formData} />
		{/if}

		<div class="mt-8 flex justify-between">
			<button 
				class="bg-secondary text-foreground px-6 py-2 rounded-md disabled:opacity-50"
				disabled={$currentStep === 1}
				on:click={prevStep}
			>
				Previous
			</button>
			
			{#if $currentStep === 4}
				<button class="bg-accent text-foreground px-6 py-2 rounded-md">
					Submit
				</button>
			{:else}
				<button 
					class="bg-primary text-foreground px-6 py-2 rounded-md"
					on:click={nextStep}
				>
					Next
				</button>
			{/if}
		</div>
	</div>
</div>