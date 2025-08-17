<!-- src/routes/submission/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	let MarkdownRenderer: any = $state(null);
	onMount(async () => {
		const mod = await import('$lib/components/ui/MarkdownRenderer.svelte');
		MarkdownRenderer = mod.default;
	});
	const { data } = $props();

	// State untuk mengelola loading dan hasil IDP
	let isLoading = $state(false);
	let idpResult = $state('');

	// Fungsi untuk menghasilkan IDP dengan AI
	async function handleGenerateIdp() {
		isLoading = true;
		idpResult = ''; // Reset hasil sebelumnya

		try {
			const response = await fetch('/api/generate-idp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					submissionId: data.submission.id
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to generate IDP');
			}

			// Proses streaming response
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('Failed to get response reader');
			}

			// Baca stream secara progresif
			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				// Decode chunk dan tambahkan ke hasil
				const chunk = decoder.decode(value, { stream: true });
				idpResult += chunk;
			}
		} catch (error: any) {
			toast.error(
				`Error: ${error.message || 'Terjadi kesalahan saat menghasilkan IDP. Silakan coba lagi.'}`
			);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto text-center">
	<!-- Ikon centang besar -->
	<div class="flex justify-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-16 w-16 text-green-500"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
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
		ID Pengajuan Anda: <span class="font-mono bg-secondary/50 px-2 py-1 rounded"
			>{data.submission.id}</span
		>
	</p>

	<!-- Ringkasan data yang dikirim -->
	<div class="text-left mt-8 bg-secondary/30 p-6 rounded-lg">
		<h2 class="text-xl font-semibold mb-4">Ringkasan Data yang Dikirim</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<h3 class="font-medium text-foreground/80">Informasi Personal</h3>
				<p class="mt-1">
					<span class="font-medium">Nama Lengkap:</span>
					{data.submission.full_name}
				</p>
				<p class="mt-1"><span class="font-medium">Email:</span> {data.submission.email}</p>
				<p class="mt-1">
					<span class="font-medium">Nomor WhatsApp:</span>
					{data.submission.whatsapp_number || 'N/A'}
				</p>
				<p class="mt-1">
					<span class="font-medium">Asal Daerah:</span>
					{data.submission.region || 'N/A'}
				</p>
			</div>

			<div>
				<h3 class="font-medium text-foreground/80">Informasi Akademik</h3>
				<p class="mt-1">
					<span class="font-medium">IPK Terakhir:</span>
					{data.submission.gpa || 'N/A'}
				</p>
				<p class="mt-1">
					<span class="font-medium">Mata Kuliah Favorit:</span>
					{data.submission.favorite_courses || 'N/A'}
				</p>
				<p class="mt-1">
					<span class="font-medium">Topik Riset:</span>
					{data.submission.research_interest || 'N/A'}
				</p>
			</div>
		</div>

		<div class="mt-4">
			<h3 class="font-medium text-foreground/80">Software/Tools yang Dikuasai</h3>
			<p class="mt-1">{data.submission.mastered_software || 'Tidak ada data'}</p>
		</div>
	</div>

	<!-- Area aksi untuk menghasilkan IDP -->
	<div class="mt-8">
		<button
			onclick={handleGenerateIdp}
			disabled={isLoading}
			class="bg-accent hover:bg-accent/90 text-foreground font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center mx-auto"
		>
			{#if isLoading}
				<svg
					class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				AI is analyzing... please wait.
			{:else}
				✨ Generate IDP with AI
			{/if}
		</button>

		<!-- Area untuk menampilkan hasil IDP -->
		{#if isLoading}
			<div class="mt-6 text-center text-foreground/70">
				<p>
					AI sedang menganalisis data Anda untuk menghasilkan rencana pengembangan individu yang
					personal...
				</p>
				{#if idpResult}
					<div
						class="prose dark:prose-invert max-w-none mt-4 p-4 bg-secondary/30 rounded-lg text-left"
					>
						<MarkdownRenderer content={idpResult} />
					</div>
				{/if}
			</div>
		{:else if idpResult}
			<div class="mt-6 p-4 bg-secondary/30 rounded-lg text-left">
				<MarkdownRenderer content={idpResult} />
			</div>
		{/if}
	</div>

	<!-- Pesan penutup -->
	<p class="mt-8 text-foreground/70">
		Individual Development Plan Anda akan segera diproses. Silakan pantau email Anda untuk informasi
		selanjutnya.
	</p>
</div>
