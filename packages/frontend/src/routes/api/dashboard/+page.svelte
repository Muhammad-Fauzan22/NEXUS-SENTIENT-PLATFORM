<!-- src/routes/idp/[id]/+page.svelte -->

<!-- Halaman untuk Menampilkan Individual Development Plan (IDP) Berdasarkan ID Unik -->

<script>
	// --- Impor ---
	import IDPViewer from '$lib/components/idp/IDPViewer.svelte';
	import IDPActionBar from '$lib/components/idp/IDPActionBar.svelte'; // Komponen untuk tombol aksi

	/**
	 * @typedef {object} IdpRecord
	 * @property {string} id - ID unik dari record IDP.
	 * @property {string} html_content - Konten IDP dalam format HTML.
	 * @property {string | null} [nim] - Nomor Induk Mahasiswa, opsional.
	 */

	/**
	 * @typedef {object} PageData
	 * @property {IdpRecord | undefined} idpData - Data IDP yang dimuat untuk halaman ini.
	 */

	/** @type {PageData} */
	export let data;
</script>

<!-- Kontainer Utama Halaman IDP -->
<div class="w-full min-h-screen flex flex-col bg-gray-100">
	{#if data?.idpData}
		<!-- 1. Tampilkan Action Bar di atas -->
		<IDPActionBar idpRecordId={data.idpData.id} />

		<!-- 2. Tampilkan Konten IDP di bawahnya -->
		<div class="flex-grow overflow-auto">
			<IDPViewer
				htmlContent={data.idpData.html_content}
				idpRecordId={data.idpData.id}
				fileName={`IDP_${data.idpData.nim || data.idpData.id}.pdf`}
			/>
		</div>
	{:else}
		<!-- Fallback jika data tidak ada -->
		<div class="flex-grow flex items-center justify-center p-4">
			<div class="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
				<h2 class="text-2xl font-bold text-red-600 mb-4">Data IDP Tidak Ditemukan</h2>
				<p class="text-gray-700 mb-4">
					Maaf, kami tidak dapat menemukan data untuk IDP yang Anda minta.
				</p>
				<a href="/dashboard" class="text-blue-600 hover:underline">Kembali ke Dashboard</a>
			</div>
		</div>
	{/if}
</div>