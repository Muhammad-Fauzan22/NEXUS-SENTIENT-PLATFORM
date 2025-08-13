<!-- src/routes/submission/[id]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	const { data } = $props<PageData>();
</script>

<div class="max-w-4xl mx-auto text-center">
	<!-- Ikon centang besar -->
	<div class="flex justify-center">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
	</div>

	<!-- Judul konfirmasi -->
	<h1 class="text-3xl font-bold text-primary mt-4">Pengajuan Berhasil!</h1>
	
	<!-- Pesan terima kasih -->
	<p class="mt-2 text-foreground/80">
		Terima kasih, {data.submission.full_name}. Data Anda telah kami terima dan simpan.
	</p>
	
	<!-- ID Pengajuan -->
	<p class="mt-1 text-sm text-secondary">
		ID Pengajuan Anda: <span class="font-mono bg-secondary/50 px-2 py-1 rounded">{data.submission.id}</span>
	</p>

	<!-- Ringkasan data -->
	<div class="text-left mt-8 bg-secondary/30 p-6 rounded-lg">
		<h2 class="text-xl font-semibold mb-4">Ringkasan Data yang Dikirim</h2>
		<div class="space-y-3">
			<div>
				<span class="font-medium text-foreground/80">Nama Lengkap:</span>
				<span class="ml-2">{data.submission.full_name}</span>
			</div>
			<div>
				<span class="font-medium text-foreground/80">Email:</span>
				<span class="ml-2">{data.submission.email}</span>
			</div>
			<div>
				<span class="font-medium text-foreground/80">Nomor WhatsApp:</span>
				<span class="ml-2">{data.submission.whatsapp_number || 'N/A'}</span>
			</div>
			<div>
				<span class="font-medium text-foreground/80">IPK Terakhir:</span>
				<span class="ml-2">{data.submission.gpa || 'N/A'}</span>
			</div>
			<div>
				<span class="font-medium text-foreground/80">Asal Daerah:</span>
				<span class="ml-2">{data.submission.region || 'N/A'}</span>
			</div>
		</div>
	</div>

	<!-- Pesan lanjutan -->
	<p class="mt-6 text-foreground/70">
		Individual Development Plan Anda akan segera diproses. Silakan periksa email Anda secara berkala.
	</p>
</div>