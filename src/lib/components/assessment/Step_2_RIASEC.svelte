<script lang="ts">
	import type { IStudentProfile } from '$lib/types/profile.ts';

	let { formData } = $props<{ formData: Partial<IStudentProfile> }>();

	// Inisialisasi struktur assessmentData.riasec jika belum ada
	formData.assessmentData = formData.assessmentData ?? {};
	formData.assessmentData.riasec = formData.assessmentData.riasec ?? {};

	// Daftar pertanyaan untuk setiap dimensi RIASEC
	const questions = [
		{ id: 'realistic', text: 'Membangun atau memperbaiki sesuatu dengan tangan' },
		{ id: 'investigative', text: 'Melakukan penelitian atau menganalisis data' },
		{ id: 'artistic', text: 'Menciptakan karya seni atau musik' },
		{ id: 'social', text: 'Membantu orang lain atau mengajar' },
		{ id: 'enterprising', text: 'Memimpin proyek atau menjual ide' },
		{ id: 'conventional', text: 'Mengelola data atau membuat laporan' }
	];

	// Label untuk skala Likert
	const likertLabels = [
		{ value: 1, label: 'Sangat Tidak Suka' },
		{ value: 2, label: 'Tidak Suka' },
		{ value: 3, label: 'Netral' },
		{ value: 4, label: 'Suka' },
		{ value: 5, label: 'Sangat Suka' }
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
							bind:group={formData.assessmentData.riasec[question.id]}
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
