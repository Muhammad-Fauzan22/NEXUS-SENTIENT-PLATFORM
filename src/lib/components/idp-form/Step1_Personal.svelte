<!-- src/lib/components/idp-form/Step1_Personal.svelte -->
<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';

	let { formData = $bindable() } = $props<{ formData: any }>();

	// Inisialisasi data personal jika belum ada
	formData.personal ??= {};
</script>

<div>
	<h3 class="text-xl font-semibold mb-6">Langkah 1: Informasi Personal</h3>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<label for="fullName" class="block mb-2 text-sm font-medium text-foreground/80">
				Nama Lengkap
			</label>
			<Input
				id="fullName"
				type="text"
				bind:value={formData.personal.fullName}
				placeholder="Masukkan nama lengkap Anda"
			/>
		</div>

		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80"> Email Pribadi </label>
			<Input type="email" bind:value={formData.personal.email} placeholder="Masukkan email Anda" />
		</div>

		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80"> Nomor Whatsapp </label>
			<Input
				type="tel"
				bind:value={formData.personal.whatsapp}
				placeholder="Masukkan nomor WhatsApp"
			/>
		</div>

		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80"> Asal Daerah </label>
			<Input
				type="text"
				bind:value={formData.personal.origin}
				placeholder="Masukkan daerah asal Anda"
			/>
		</div>
	</div>
</div>
