<script lang="ts">
	import { assessmentStore } from '$lib/stores/assessmentStore';
	import Step_1_UserData from '$lib/components/assessment/Step_1_UserData.svelte';
	import Step_2_RIASEC from '$lib/components/assessment/Step_2_RIASEC.svelte';
	import Step_3_PWB from '$lib/components/assessment/Step_3_PWB.svelte';
	import AssessmentResult from '$lib/components/assessment/AssessmentResult.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const state = assessmentStore;
</script>

<div class="max-w-4xl mx-auto">
	{#if $state.submission.state === 'loading'}
		<Card>
			<div class="text-center p-8">
				<h2 class="text-2xl font-bold text-gray-800">Generating Your Plan...</h2>
				<p class="text-gray-600 mt-2">
					Our AI is analyzing your results and crafting your personalized development plan. This may
					take a moment.
				</p>
				<div class="mt-6">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			</div>
		</Card>
	{:else if $state.submission.state === 'success'}
		<AssessmentResult />
	{:else if $state.submission.state === 'error'}
		<Card>
			<div class="text-center p-8">
				<h2 class="text-2xl font-bold text-red-600">An Error Occurred</h2>
				<p class="text-gray-600 mt-2">
					We're sorry, but something went wrong while generating your plan.
				</p>
				<p class="text-sm text-gray-500 bg-red-50 p-3 my-4 rounded-md">
					<strong>Error:</strong> {$state.submission.error}
				</p>
				<Button on:click={state.reset} variant="primary">Try Again</Button>
			</div>
		</Card>
	{:else}
		{#if $state.currentStep === 1}
			<Step_1_UserData />
		{:else if $state.currentStep === 2}
			<Step_2_RIASEC />
		{:else if $state.currentStep === 3}
			<Step_3_PWB />
		{/if}
	{/if}
</div>