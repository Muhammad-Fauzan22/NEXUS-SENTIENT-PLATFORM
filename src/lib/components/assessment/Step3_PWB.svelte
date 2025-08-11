<script lang="ts">
	import { assessmentStore } from '$stores/assessmentStore';
	import RadioGroup from '$components/ui/RadioGroup.svelte';
	import RadioGroupItem from '$components/ui/RadioGroupItem.svelte';
	import FormField from '$components/ui/FormField.svelte';

	// Inisialisasi state PWB jika belum ada
	if (!$assessmentStore.pwb_scores) {
		$assessmentStore.pwb_scores = {
			self_acceptance: 1,
			positive_relations: 1,
			autonomy: 1,
			environmental_mastery: 1,
			purpose_in_life: 1,
			personal_growth: 1
		};
	}

	const questions = [
		{
			id: 'self_acceptance',
			label: 'Penerimaan Diri',
			description: 'Saya memiliki pandangan positif terhadap diri saya sendiri.'
		},
		{
			id: 'positive_relations',
			label: 'Hubungan Positif',
			description: 'Saya merasa memiliki hubungan yang hangat dan memuaskan dengan orang lain.'
		},
		{
			id: 'autonomy',
			label: 'Otonomi',
			description: 'Saya yakin dengan pendapat saya, bahkan jika berbeda dari konsensus umum.'
		},
		{
			id: 'environmental_mastery',
			label: 'Penguasaan Lingkungan',
			description: 'Saya mampu mengelola tanggung jawab kehidupan sehari-hari dengan baik.'
		},
		{
			id: 'purpose_in_life',
			label: 'Tujuan Hidup',
			description: 'Saya merasa hidup saya memiliki arah dan makna.'
		},
		{
			id: 'personal_growth',
			label: 'Pertumbuhan Pribadi',
			description: 'Saya melihat diri saya berkembang sebagai pribadi dan terus menjadi lebih baik.'
		}
	];

	const scoreOptions = [
		{ value: 1, label: 'Sangat Tidak Setuju' },
		{ value: 2, label: 'Tidak Setuju' },
		{ value: 3, label: 'Netral' },
		{ value: 4, label: 'Setuju' },
		{ value: 5, label: 'Sangat Setuju' }
	];
</script>

<div class="space-y-8 p-2">
	<div class="text-center">
		<h2 class="text-2xl font-serif font-semibold text-text">
			Langkah 3: Kesejahteraan Psikologis (PWB)
		</h2>
		<p class="text-neutral-600 mt-2">
			Seberapa setuju Anda dengan pernyataan-pernyataan berikut?
		</p>
	</div>

	{#each questions as question (question.id)}
		<RadioGroup bind:value={$assessmentStore.pwb_scores[question.id]} name={`pwb-${question.id}`}>
			<FormField label="" forId="">
				<div class="p-4 border rounded-lg">
					<p class="font-semibold">{question.label}</p>
					<p class="text-sm text-neutral-600 mb-4">{question.description}</p>
					<div class="flex flex-wrap justify-between gap-4">
						{#each scoreOptions as option (option.value)}
							<RadioGroupItem value={option.value} id={`pwb-${question.id}-${option.value}`}>
								{option.label}
							</RadioGroupItem>
						{/each}
					</div>
				</div>
			</FormField>
		</RadioGroup>
	{/each}
</div>