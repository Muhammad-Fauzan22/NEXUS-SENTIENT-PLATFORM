<!-- src/lib/components/assessment/Step4_Review.svelte -->
<script lang="ts">
	import type { IStudentProfile } from '$lib/types/profile.ts';

	let { formData } = $props<{ formData: Partial<IStudentProfile> }>();
</script>

<div class="space-y-8">
	<h3 class="text-xl font-semibold">Review Your Information</h3>

	<!-- Personal Information Section -->
	<div>
		<h4 class="text-lg font-medium mb-2">Personal Details</h4>
		<div class="bg-secondary p-4 rounded-md">
			<p><span class="font-medium">Full Name:</span> {formData.fullName || 'Not provided'}</p>
			<p><span class="font-medium">Email:</span> {formData.email || 'Not provided'}</p>
			<p><span class="font-medium">Student ID:</span> {formData.studentId || 'Not provided'}</p>
		</div>
	</div>

	<!-- RIASEC Assessment Section -->
	<div>
		<h4 class="text-lg font-medium mb-2">RIASEC Preferences</h4>
		<div class="bg-secondary p-4 rounded-md">
			{#if formData.assessmentData?.riasec}
				{#each Object.entries(formData.assessmentData.riasec) as [dimension, score]}
					<p><span class="font-medium capitalize">{dimension}:</span> {score ?? 'Not rated'}</p>
				{/each}
			{:else}
				<p>No RIASEC data provided</p>
			{/if}
		</div>
	</div>

	<!-- Big Five Assessment Section -->
	<div>
		<h4 class="text-lg font-medium mb-2">Big Five Personality Traits</h4>
		<div class="bg-secondary p-4 rounded-md">
			{#if formData.assessmentData?.bigFive}
				{#each Object.entries(formData.assessmentData.bigFive) as [trait, score]}
					<p><span class="font-medium capitalize">{trait}:</span> {score ?? 'Not rated'}</p>
				{/each}
			{:else}
				<p>No Big Five data provided</p>
			{/if}
		</div>
	</div>

	<p class="text-foreground/80 text-sm mt-4">
		Please ensure all information is correct before submitting. This action cannot be undone.
	</p>
</div>
