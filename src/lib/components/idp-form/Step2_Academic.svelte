<script lang="ts">
	let { formData } = $props<{ formData: any }>();
	
	// Inisialisasi data akademik jika belum ada
	formData.academic ??= {};
</script>

<div>
	<h3 class="text-xl font-semibold mb-6">Langkah 2: Riwayat & Minat Akademik</h3>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				IPK Terakhir
			</label>
			<input 
				type="number"
				step="0.01"
				bind:value={formData.academic.gpa}
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Contoh: 3.85"
			/>
		</div>
		
		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				Mata Kuliah Favorit
			</label>
			<input 
				type="text"
				bind:value={formData.academic.favoriteCourses}
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Contoh: Mekanika Fluida, Termodinamika"
			/>
		</div>
		
		<div class="md:col-span-2">
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				Topik Riset/TA yang Diminati
			</label>
			<textarea 
				bind:value={formData.academic.researchInterest}
				rows="4"
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Jelaskan topik spesifik yang menarik minat Anda untuk penelitian..."
			></textarea>
		</div>
		
		<div class="md:col-span-2">
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				Software/Tools yang Dikuasai
			</label>
			<textarea 
				bind:value={formData.academic.tools}
				rows="4"
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Contoh: Ansys Fluent, SolidWorks, MATLAB, Python"
			></textarea>
		</div>
	</div>
</div>