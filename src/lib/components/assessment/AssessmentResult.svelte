<script lang="ts">
	import { assessmentStore } from '../../stores/assessmentStore';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';

	const { result } = $assessmentStore;

	function startOver() {
		assessmentStore.reset();
	}
</script>

{#if result}
	<div class="space-y-6">
		<Card>
			<h1 class="text-3xl font-bold text-gray-900">{result.title}</h1>
			<p class="mt-2 text-lg text-gray-600">{result.introduction}</p>
		</Card>

		<Card>
			<h2 class="text-2xl font-semibold text-gray-800 mb-3">Analysis of Your Strengths</h2>
			<p class="text-gray-700 mb-4">{result.strengthsAnalysis.summary}</p>
			<ul class="list-disc list-inside space-y-2">
				{#each result.strengthsAnalysis.points as point}
					<li class="text-gray-600">{point}</li>
				{/each}
			</ul>
		</Card>

		<Card>
			<h2 class="text-2xl font-semibold text-gray-800 mb-3">Potential Growth Areas</h2>
			<p class="text-gray-700 mb-4">{result.growthAreas.summary}</p>
			<ul class="list-disc list-inside space-y-2">
				{#each result.growthAreas.points as point}
					<li class="text-gray-600">{point}</li>
				{/each}
			</ul>
		</Card>

		<Card>
			<h2 class="text-2xl font-semibold text-gray-800 mb-4">Your Action Plan</h2>
			<div class="space-y-6">
				<div>
					<h3 class="text-xl font-bold text-emerald-700 mb-3">Leverage Your Strengths</h3>
					{#each result.actionPlan.strengths as item}
						<div class="border-t border-gray-200 pt-3 mt-3">
							<h4 class="font-semibold text-gray-800">{item.title}</h4>
							<p class="text-gray-600 mt-1">{item.description}</p>
							<p class="text-xs text-gray-500 mt-1"><em><strong>Why:</strong> {item.rationale}</em></p>
						</div>
					{/each}
				</div>
				<div>
					<h3 class="text-xl font-bold text-amber-700 mb-3">Develop Your Potential</h3>
					{#each result.actionPlan.growth as item}
						<div class="border-t border-gray-200 pt-3 mt-3">
							<h4 class="font-semibold text-gray-800">{item.title}</h4>
							<p class="text-gray-600 mt-1">{item.description}</p>
							<p class="text-xs text-gray-500 mt-1"><em><strong>Why:</strong> {item.rationale}</em></p>
						</div>
					{/each}
				</div>
			</div>
		</Card>

		<div class="text-center">
			<Button on:click={startOver} variant="secondary">Start New Assessment</Button>
		</div>
	</div>
{/if}