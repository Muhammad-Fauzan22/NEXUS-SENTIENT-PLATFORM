<!-- src/routes/submission/[id]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	
	const { data } = $props<PageData>();
</script>

<div class="max-w-4xl mx-auto text-center">
	<!-- Ikon centang besar -->
	<div class="flex justify-center">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
	
	<!-- Ringkasan data yang dikirim -->
	<div class="text-left mt-8 bg-secondary/30 p-6 rounded-lg">
		<h2 class="text-xl font-semibold mb-4">Ringkasan Data yang Dikirim</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<h3 class="font-medium text-foreground/80">Informasi Personal</h3>
				<p class="mt-1"><span class="font-medium">Nama Lengkap:</span> {data.submission.full_name}</p>
				<p class="mt-1"><span class="font-medium">Email:</span> {data.submission.email}</p>
				<p class="mt-1"><span class="font-medium">Nomor WhatsApp:</span> {data.submission.whatsapp_number || 'N/A'}</p>
				<p class="mt-1"><span class="font-medium">Asal Daerah:</span> {data.submission.region || 'N/A'}</p>
			</div>
			
			<div>
				<h3 class="font-medium text-foreground/80">Informasi Akademik</h3>
				<p class="mt-1"><span class="font-medium">IPK Terakhir:</span> {data.submission.gpa || 'N/A'}</p>
				<p class="mt-1"><span class="font-medium">Mata Kuliah Favorit:</span> {data.submission.favorite_courses || 'N/A'}</p>
				<p class="mt-1"><span class="font-medium">Topik Riset:</span> {data.submission.research_interest || 'N/A'}</p>
			</div>
		</div>
		
		<div class="mt-4">
			<h3 class="font-medium text-foreground/80">Software/Tools yang Dikuasai</h3>
			<p class="mt-1">{data.submission.mastered_software || 'Tidak ada data'}</p>
		</div>
	</div>
	
	<!-- Pesan penutup -->
	<p class="mt-8 text-foreground/70">
		Individual Development Plan Anda akan segera diproses. Silakan pantau email Anda untuk informasi selanjutnya.
	</p>
</div>