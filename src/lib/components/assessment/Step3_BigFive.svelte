<!-- src/lib/components/assessment/Step3_BigFive.svelte -->
<script lang="ts">
	import type { IStudentProfile } from '$lib/types/profile.ts';

	let { formData = $bindable() } = $props<{ formData: Partial<IStudentProfile> }>();

	// Inisialisasi struktur assessmentData.bigFive jika belum ada
	formData.assessmentData = formData.assessmentData ?? {};
	formData.assessmentData.bigFive = formData.assessmentData.bigFive ?? {};

	// Daftar pernyataan untuk setiap dimensi Big Five (OCEAN)
	const questions = [
		{ id: 'openness', text: 'Saya memiliki imajinasi yang hidup dan aktif.' },
		{ id: 'conscientiousness', text: 'Saya selalu siap sebelum melakukan tugas penting.' },
		{ id: 'extraversion', text: 'Saya merasa nyaman berada di tengah kerumunan orang.' },
		{ id: 'agreeableness', text: 'Saya cenderung percaya bahwa orang lain memiliki niat baik.' },
		{ id: 'neuroticism', text: 'Saya sering merasa cemas atau tertekan.' }
	];

	// Label untuk skala Likert
	const likertLabels = [
		{ value: 1, label: 'Sangat Tidak Setuju' },
		{ value: 2, label: 'Tidak Setuju' },
		{ value: 3, label: 'Netral' },
		{ value: 4, label: 'Setuju' },
		{ value: 5, label: 'Sangat Setuju' }
	];
</script>

<div class="space-y-8">
	{#each questions as question}
		<div>
			<p class="font-medium">{question.text}</p>
			<div class="flex items-center space-x-4 mt-2">
				{#each likertLabels as likert}
					<div class="flex items-center">
						<input
							type="radio"
							id="{question.id}-{likert.value}"
							name={question.id}
							value={likert.value}
							bind:group={formData.assessmentData.bigFive[question.id]}
							class="h-4 w-4 text-accent focus:ring-accent"
						/>
						<label for="{question.id}-{likert.value}" class="ml-1 text-sm">
							{likert.label}
						</label>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
