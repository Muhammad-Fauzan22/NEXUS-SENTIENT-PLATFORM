<script lang="ts">
	import { assessmentStore } from '$stores/assessmentStore';
	import FormField from '$components/ui/FormField.svelte';
	import Input from '$components/ui/Input.svelte';
	import Textarea from '$components/ui/Textarea.svelte';
	import { assessmentSchema } from '$lib/types/schemas';
	import { z } from 'zod';

	// Turunkan tipe data spesifik untuk langkah ini dari skema utama
	type UserData = z.infer<typeof assessmentSchema.shape.portfolio_text | typeof assessmentSchema.shape.aspirations>;

	// State untuk error validasi lokal
	let errors: Record<keyof UserData, string | null> = {
		portfolio_text: null,
		aspirations: null
	};

	function validateField(fieldName: keyof UserData, value: string) {
		const fieldSchema = assessmentSchema.shape[fieldName];
		const result = fieldSchema.safeParse(value);
		if (!result.success) {
			errors[fieldName] = result.error.errors[0].message;
		} else {
			errors[fieldName] = null;
		}
	}
</script>

<div class="space-y-6 p-2">
	<h2 class="text-2xl font-serif font-semibold text-text">Langkah 1: Profil & Aspirasi Anda</h2>
	<p class="text-neutral-600">
		Ceritakan tentang diri Anda, pengalaman yang telah membentuk Anda, dan ke mana Anda ingin melangkah.
		Jawaban Anda akan menjadi fondasi dari roadmap pengembangan Anda.
	</p>

	<FormField
		label="Portofolio & Pengalaman Diri"
		forId="portfolio_text"
		errorMessage={errors.portfolio_text}
	>
		<Textarea
			id="portfolio_text"
			placeholder="Ceritakan pengalaman organisasi, kepanitiaan, prestasi, atau proyek relevan yang pernah Anda ikuti. Jelaskan peran dan kontribusi Anda..."
			rows={8}
			bind:value={$assessmentStore.portfolio_text}
			on:blur={() => validateField('portfolio_text', $assessmentStore.portfolio_text)}
			hasError={!!errors.portfolio_text}
			required
		/>
		<p class="text-xs text-neutral-500">Minimal 100 karakter.</p>
	</FormField>

	<FormField label="Aspirasi Karir & Tujuan Jangka Panjang" forId="aspirations" errorMessage={errors.aspirations}>
		<Textarea
			id="aspirations"
			placeholder="Jelaskan secara spesifik cita-cita atau peran profesional yang ingin Anda capai setelah lulus. Contoh: 'Menjadi Human Capital consultant di Deloitte' atau 'Mendirikan startup di bidang energi terbarukan'."
			rows={4}
			bind:value={$assessmentStore.aspirations}
			on:blur={() => validateField('aspirations', $assessmentStore.aspirations)}
			hasError={!!errors.aspirations}
			required
		/>
		<p class="text-xs text-neutral-500">Minimal 20 karakter.</p>
	</FormField>
</div>