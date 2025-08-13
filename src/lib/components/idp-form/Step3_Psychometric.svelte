<script lang="ts">
	let { formData } = $props<{ formData: any }>();
	
	// Inisialisasi data psikometri jika belum ada
	formData.psychometric ??= {};
	
	// Skala penilaian Likert
	const likertOptions = [
		{ value: 1, label: 'Sangat Tidak Sesuai' },
		{ value: 2, label: 'Tidak Sesuai' },
		{ value: 3, label: 'Netral' },
		{ value: 4, label: 'Sesuai' },
		{ value: 5, label: 'Sangat Sesuai' }
	];
	
	// Pernyataan untuk asesmen RIASEC
	const riasecStatements = [
		{ id: 'realistic', text: 'Saya suka bekerja dengan tangan, mesin, atau alat-alat untuk membuat sesuatu.' },
		{ id: 'investigative', text: 'Saya tertarik untuk memecahkan masalah yang kompleks dan analitis.' },
		{ id: 'artistic', text: 'Saya menikmati mengekspresikan ide-ide secara kreatif melalui tulisan, musik, atau seni.' },
		{ id: 'social', text: 'Saya merasa puas saat membantu, mengajar, atau melayani orang lain.' },
		{ id: 'enterprising', text: 'Saya suka memimpin, membujuk, dan mengambil peran dalam sebuah tim untuk mencapai tujuan.' },
		{ id: 'conventional', text: 'Saya menyukai pekerjaan yang terstruktur, rapi, dan mengikuti prosedur yang jelas.' }
	];
	
	// Pernyataan untuk asesmen PWB
	const pwbStatements = [
		{ id: 'autonomy', text: 'Saya percaya diri dengan pendapat saya, bahkan jika berbeda dari orang lain.' },
		{ id: 'personalGrowth', text: 'Saya merasa penting untuk memiliki pengalaman baru yang menantang cara saya berpikir.' },
		{ id: 'purposeInLife', text: 'Saya memiliki tujuan dan arah yang jelas dalam hidup saya.' }
	];
</script>

<div>
	<h3 class="text-xl font-semibold mb-2">Langkah 3: Asesmen Minat & Diri</h3>
	<p class="text-foreground/80 mb-6">Pilih sejauh mana setiap pernyataan mendeskripsikan diri Anda.</p>
	
	<!-- Asesmen Minat (RIASEC) -->
	<div class="space-y-6">
		{#each riasecStatements as statement}
			<div>
				<label class="block mb-2 text-sm font-medium text-foreground/80">
					{statement.text}
				</label>
				<div class="flex gap-4 flex-wrap">
					{#each likertOptions as option}
						<div class="flex items-center">
							<input 
								type="radio"
								id="{statement.id}-{option.value}"
								name={statement.id}
								value={option.value}
								bind:group={formData.psychometric[statement.id]}
								class="h-4 w-4 text-primary focus:ring-primary"
							/>
							<label for="{statement.id}-{option.value}" class="ml-2 text-sm text-foreground/90">
								{option.label}
							</label>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
	
	<!-- Asesmen Diri (PWB) -->
	<h4 class="text-lg font-medium mt-8 mb-4">Asesmen Diri (Psychological Well-Being)</h4>
	<div class="space-y-6">
		{#each pwbStatements as statement}
			<div>
				<label class="block mb-2 text-sm font-medium text-foreground/80">
					{statement.text}
				</label>
				<div class="flex gap-4 flex-wrap">
					{#each likertOptions as option}
						<div class="flex items-center">
							<input 
								type="radio"
								id="{statement.id}-{option.value}"
								name={statement.id}
								value={option.value}
								bind:group={formData.psychometric[statement.id]}
								class="h-4 w-4 text-primary focus:ring-primary"
							/>
							<label for="{statement.id}-{option.value}" class="ml-2 text-sm text-foreground/90">
								{option.label}
							</label>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>