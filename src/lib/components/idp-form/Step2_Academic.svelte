<!-- src/lib/components/idp-form/Step2_Academic.svelte -->
<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';

	let { formData = $bindable() } = $props<{ formData: any }>();

	// Inisialisasi data akademik jika belum ada
	formData.academic ??= {};
</script>

<div>
	<h3 class="text-xl font-semibold mb-6">Langkah 2: Riwayat & Minat Akademik</h3>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<label for="gpa" class="block mb-2 text-sm font-medium text-foreground/80">
				IPK Terakhir
			</label>
			<Input
				id="gpa"
				type="number"
				step="0.01"
				bind:value={formData.academic.gpa}
				placeholder="Contoh: 3.85"
			/>
		</div>

		<div>
			<label for="favoriteCourses" class="block mb-2 text-sm font-medium text-foreground/80">
				Mata Kuliah Favorit
			</label>
			<Input
				id="favoriteCourses"
				type="text"
				bind:value={formData.academic.favoriteCourses}
				placeholder="Contoh: Mekanika Fluida, Termodinamika"
			/>
		</div>

		<div class="md:col-span-2">
			<label for="researchInterest" class="block mb-2 text-sm font-medium text-foreground/80">
				Topik Riset/TA yang Diminati
			</label>
			<Textarea
				id="researchInterest"
				bind:value={formData.academic.researchInterest}
				rows="4"
				placeholder="Jelaskan topik spesifik yang menarik minat Anda untuk penelitian..."
			/>
		</div>

		<div class="md:col-span-2">
			<label for="tools" class="block mb-2 text-sm font-medium text-foreground/80">
				Software/Tools yang Dikuasai
			</label>
			<Textarea
				id="tools"
				bind:value={formData.academic.tools}
				rows="4"
				placeholder="Contoh: Ansys Fluent, SolidWorks, MATLAB, Python"
			/>
		</div>
	</div>
</div>
