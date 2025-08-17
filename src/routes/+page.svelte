<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/Button.svelte';
	import Step1_Personal from '$lib/components/idp-form/Step1_Personal.svelte';
	import Step2_Academic from '$lib/components/idp-form/Step2_Academic.svelte';
	import Step3_Psychometric from '$lib/components/idp-form/Step3_Psychometric.svelte';
	import Step4_Review from '$lib/components/idp-form/Step4_Review.svelte';

	const currentStep = writable(1);
	const formData = writable({});
	const isLoading = writable(false);

	function nextStep() {
		currentStep.update((n) => n + 1);
	}

	function prevStep() {
		currentStep.update((n) => n - 1);
	}

	async function handleSubmit() {
		isLoading.set(true);

		try {
			const res = await fetch('/api/submit-idp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($formData)
			});

			if (!res.ok) {
				throw new Error();
			}

			const result = await res.json();
			// Ganti alert dengan navigasi ke halaman konfirmasi
			await goto(`/submission/${result.submissionId}`);
		} catch (error) {
			toast.error('Gagal mengirim data. Silakan periksa koneksi Anda dan coba lagi.');
		} finally {
			isLoading.set(false);
		}
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
			<Button variant="secondary" disabled={$currentStep === 1} on:click={prevStep}>
				Previous
			</Button>

			<div class="flex gap-2">
				{#if $currentStep === 4}
					<Button variant="primary" disabled={$isLoading} on:click={handleSubmit}>
						{#if $isLoading}
							Submitting...
						{:else}
							Submit
						{/if}
					</Button>
				{/if}

				{#if $currentStep < 4}
					<Button variant="primary" disabled={$currentStep === 4} on:click={nextStep}>Next</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
