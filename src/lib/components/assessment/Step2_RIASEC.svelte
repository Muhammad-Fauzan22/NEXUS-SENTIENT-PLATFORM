<script lang="ts">
	import { assessmentStore } from '$stores/assessmentStore';
	import RadioGroup from '$components/ui/RadioGroup.svelte';
	import RadioGroupItem from '$components/ui/RadioGroupItem.svelte';
	import FormField from '$components/ui/FormField.svelte';

	// Inisialisasi state RIASEC jika belum ada
	if (!$assessmentStore.riasec_scores) {
		$assessmentStore.riasec_scores = { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 };
	}

	const questions = [
		{
			id: 'R',
			label: 'Realistic (Doers)',
			description: 'Saya suka bekerja dengan tangan, mesin, atau alat; memperbaiki atau membuat sesuatu.'
		},
		{
			id: 'I',
			label: 'Investigative (Thinkers)',
			description: 'Saya suka memecahkan masalah yang kompleks, melakukan riset, dan bekerja dengan ide.'
		},
		{
			id: 'A',
			label: 'Artistic (Creators)',
			description: 'Saya suka terlibat dalam aktivitas kreatif seperti seni, drama, musik, atau menulis.'
		},
		{
			id: 'S',
			label: 'Social (Helpers)',
			description: 'Saya suka membantu, mengajar, atau memberikan pelayanan kepada orang lain.'
		},
		{
			id: 'E',
			label: 'Enterprising (Persuaders)',
			description: 'Saya suka memimpin, membujuk orang lain, dan menjual ide atau produk.'
		},
		{
			id: 'C',
			label: 'Conventional (Organizers)',
			description: 'Saya suka bekerja dengan data, memiliki aturan yang jelas, dan menjaga semuanya terorganisir.'
		}
	];

	const scoreOptions = [
		{ value: 1, label: 'Sangat Tidak Sesuai' },
		{ value: 2, label: 'Tidak Sesuai' },
		{ value: 3, label: 'Netral' },
		{ value: 4, label: 'Sesuai' },
		{ value: 5, label: 'Sangat Sesuai' }
	];
</script>

<div class="space-y-8 p-2">
	<div class="text-center">
		<h2 class="text-2xl font-serif font-semibold text-text">Langkah 2: Minat Vokasional (RIASEC)</h2>
		<p class="text-neutral-600 mt-2">
			Seberapa sesuai pernyataan-pernyataan berikut dengan diri Anda?
		</p>
	</div>

	{#each questions as question (question.id)}
		<RadioGroup bind:value={$assessmentStore.riasec_scores[question.id]} name={`riasec-${question.id}`}>
			<FormField label="" forId="">
				<div class="p-4 border rounded-lg">
					<p class="font-semibold">{question.label}</p>
					<p class="text-sm text-neutral-600 mb-4">{question.description}</p>
					<div class="flex flex-wrap justify-between gap-4">
						{#each scoreOptions as option (option.value)}
							<RadioGroupItem value={option.value} id={`riasec-${question.id}-${option.value}`}>
								{option.label}
							</RadioGroupItem>
						{/each}
					</div>
				</div>
			</FormField>
		</RadioGroup>
	{/each}
</div>