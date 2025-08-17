<!-- src/lib/components/idp-form/Step3_Psychometric.svelte -->
<script lang="ts">
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	let { formData = $bindable() } = $props<{ formData: any }>();

	// Inisialisasi data psikometri jika belum ada
	formData.psychometric ??= {};

	// Skala penilaian Likert
	const likertOptions = [
		'Sangat Tidak Sesuai',
		'Tidak Sesuai',
		'Netral',
		'Sesuai',
		'Sangat Sesuai'
	];
</script>

<div>
	<h3 class="text-xl font-semibold mb-2">Langkah 3: Asesmen Minat & Diri</h3>
	<p class="text-foreground/80 mb-6">
		Pilih sejauh mana setiap pernyataan mendeskripsikan diri Anda.
	</p>

	<!-- Asesmen Minat (RIASEC) -->
	<div class="space-y-4">
		<RadioGroup
			label="Saya suka bekerja dengan tangan, mesin, atau alat-alat untuk membuat sesuatu."
			options={likertOptions}
			name="realistic-assessment"
			bind:group={formData.psychometric.realistic}
		/>

		<RadioGroup
			label="Saya tertarik untuk memecahkan masalah yang kompleks dan analitis."
			options={likertOptions}
			name="investigative-assessment"
			bind:group={formData.psychometric.investigative}
		/>

		<RadioGroup
			label="Saya menikmati mengekspresikan ide-ide secara kreatif melalui tulisan, musik, atau seni."
			options={likertOptions}
			name="artistic-assessment"
			bind:group={formData.psychometric.artistic}
		/>

		<RadioGroup
			label="Saya merasa puas saat membantu, mengajar, atau melayani orang lain."
			options={likertOptions}
			name="social-assessment"
			bind:group={formData.psychometric.social}
		/>

		<RadioGroup
			label="Saya suka memimpin, membujuk, dan mengambil peran dalam sebuah tim untuk mencapai tujuan."
			options={likertOptions}
			name="enterprising-assessment"
			bind:group={formData.psychometric.enterprising}
		/>

		<RadioGroup
			label="Saya menyukai pekerjaan yang terstruktur, rapi, dan mengikuti prosedur yang jelas."
			options={likertOptions}
			name="conventional-assessment"
			bind:group={formData.psychometric.conventional}
		/>
	</div>

	<!-- Asesmen Diri (PWB) -->
	<h4 class="text-lg font-medium mt-8 mb-4">Asesmen Diri (Psychological Well-Being)</h4>
	<div class="space-y-4">
		<RadioGroup
			label="Saya percaya diri dengan pendapat saya, bahkan jika berbeda dari orang lain."
			options={likertOptions}
			name="autonomy-assessment"
			bind:group={formData.psychometric.autonomy}
		/>

		<RadioGroup
			label="Saya merasa penting untuk memiliki pengalaman baru yang menantang cara saya berpikir."
			options={likertOptions}
			name="personal-growth-assessment"
			bind:group={formData.psychometric.personalGrowth}
		/>

		<RadioGroup
			label="Saya memiliki tujuan dan arah yang jelas dalam hidup saya."
			options={likertOptions}
			name="purpose-in-life-assessment"
			bind:group={formData.psychometric.purposeInLife}
		/>
	</div>
</div>
