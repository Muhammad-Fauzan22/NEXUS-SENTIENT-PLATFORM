<!-- src/routes/idp/[id]/+page.svelte -->
<!-- Halaman untuk Menampilkan Individual Development Plan (IDP) Berdasarkan ID Unik -->

<script>
	// --- Impor ---
	import logger from '$lib/server/utils/logger';
	import { supabaseAdmin } from '$lib/server/db/supabase.admin'; // Gunakan admin untuk query
	import IDPViewer from '$lib/components/idp/IDPViewer.svelte'; // Komponen viewer yang telah dibuat

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<!-- Kontainer Utama Halaman IDP -->
<div class="w-full min-h-screen flex flex-col bg-gray-100">
	{#if data?.idpData}
		<!-- Jika data IDP ditemukan, render komponen IDPViewer -->
		<IDPViewer
			htmlContent={data.idpData.html_content}
			idpRecordId={data.idpData.id}
			fileName={`IDP_${data.idpData.id}.pdf`}
		/>
	{:else}
		<!-- Fallback jika data tidak ada -->
		<div class="flex-grow flex items-center justify-center p-4">
			<div class="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
				<h2 class="text-2xl font-bold text-red-600 mb-4">Ups!</h2>
				<p class="text-gray-700 mb-4">Terjadi kesalahan saat memuat data IDP.</p>
				<p class="text-sm text-gray-500">(Data IDP tidak tersedia.)</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Tidak ada styling khusus yang diperlukan selain Tailwind */
</style>