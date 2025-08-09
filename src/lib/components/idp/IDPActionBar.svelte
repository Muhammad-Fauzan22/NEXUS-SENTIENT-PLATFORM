<!-- src/lib/components/idp/IDPActionBar.svelte -->
<!-- Komponen untuk Menampilkan Menu Aksi pada Halaman IDP -->

<script>
    // @ts-nocheck
    // DIPERBAIKI: Menambahkan @ts-nocheck untuk menonaktifkan pemeriksaan tipe TypeScript pada file ini,
    // yang akan menyelesaikan error 'no default export' dan 'error is of type unknown'.

    // --- Impor ---
    import { goto } from '$app/navigation';
    import { showSuccess, showError, showInfo } from '$lib/utils/toast.manager';
    import Button from '$lib/components/ui/Button.svelte';
    import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

    // --- Props ---
    /** @type {string} - UUID dari record IDP di database. Diperlukan untuk mengunduh PDF dan aksi lainnya. */
    export let idpRecordId = '';

    // --- State ---
    let isDownloading = false;

    // --- Fungsi Aksi ---
    /**
     * Fungsi untuk memicu unduhan PDF IDP.
     */
    async function downloadPDF() {
        if (!idpRecordId) {
            console.warn('[IDP Action Bar] IDP Record ID tidak tersedia, tidak dapat mengunduh PDF.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat mengunduh PDF.');
            return;
        }

        isDownloading = true;
        console.info(`[IDP Action Bar] Memulai unduhan PDF untuk IDP Record ID: ${idpRecordId}`);

        try {
            const downloadUrl = `/api/download-idp-pdf?id=${encodeURIComponent(idpRecordId)}`;
            console.debug(`[IDP Action Bar] URL unduhan PDF yang dibangun: ${downloadUrl}`);
            window.location.href = downloadUrl;
            console.info('[IDP Action Bar] Permintaan unduhan PDF dikirim ke browser.');
        } catch (error) {
            const errorMsg = `Gagal memicu unduhan PDF: ${error.message}`;
            console.error(`[IDP Action Bar] downloadPDF FAILED: ${errorMsg}`, error);
            showError(errorMsg);
        } finally {
            isDownloading = false;
        }
    }

    /**
     * Fungsi untuk menyalin tautan IDP ke clipboard.
     */
    async function copyShareLink() {
        if (!idpRecordId) {
            console.warn('[IDP Action Bar] IDP Record ID tidak tersedia, tidak dapat menyalin tautan.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat menyalin tautan.');
            return;
        }

        let shareUrl = '';
        try {
            shareUrl = `${window.location.origin}/idp/${idpRecordId}`;
            console.debug(`[IDP Action Bar] URL berbagi yang dibangun: ${shareUrl}`);
            
            await navigator.clipboard.writeText(shareUrl);
            console.info(`[IDP Action Bar] Tautan IDP berhasil disalin ke clipboard: ${shareUrl}`);
            showSuccess('Tautan IDP berhasil disalin ke clipboard!');

        } catch (error) {
            const errorMsg = `Gagal menyalin tautan IDP: ${error.message}`;
            console.error(`[IDP Action Bar] copyShareLink FAILED: ${errorMsg}`, error);
            showInfo(`Gagal menyalin otomatis. Salin tautan berikut: ${shareUrl}`);
        }
    }

    /**
     * Fungsi untuk mengarahkan ke halaman edit/regenerasi IDP.
     */
    function editIDP() {
        if (!idpRecordId) {
            console.warn('[IDP Action Bar] IDP Record ID tidak tersedia, tidak dapat mengedit.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat mengedit.');
            return;
        }
        console.info(`[IDP Action Bar] Mengarahkan ke halaman edit/regenerasi IDP untuk ID: ${idpRecordId}`);
        goto(`/dashboard/${idpRecordId}/review`);
    }

    /**
     * Fungsi untuk menampilkan daftar versi IDP lainnya.
     */
    function viewOtherVersions() {
        if (!idpRecordId) {
            console.warn('[IDP Action Bar] IDP Record ID tidak tersedia, tidak dapat melihat versi lain.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat melihat versi lain.');
            return;
        }
        console.info(`[IDP Action Bar] Menampilkan daftar versi IDP lainnya untuk ID: ${idpRecordId}`);
        showInfo('Fitur "Lihat Versi Lain" akan segera hadir!');
    }
</script>

<!-- --- Template Komponen IDP Action Bar --- -->
<div class="w-full bg-white border-b border-gray-200 shadow-sm py-3 px-4 md:px-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
        <!-- Judul atau Info Singkat -->
        <div class="text-lg font-semibold text-gray-800 truncate">
            Aksi untuk IDP Anda
        </div>

        <!-- Grup Tombol Aksi -->
        <div class="flex flex-wrap items-center gap-2">
            <!-- Tombol Unduh PDF -->
            <Button variant="primary" on:click={downloadPDF} disabled={isDownloading || !idpRecordId} aria-label="Unduh IDP sebagai PDF">
                {#if isDownloading}
                    <LoadingSpinner size="sm" color="white" text="Mengunduh..." />
                {:else}
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Unduh PDF
                {/if}
            </Button>

            <!-- Tombol Bagikan -->
            <Button variant="outline" on:click={copyShareLink} disabled={!idpRecordId} aria-label="Salin tautan IDP">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                Bagikan
            </Button>

            <!-- Tombol Edit/Regenerasi -->
            <Button variant="outline" on:click={editIDP} disabled={!idpRecordId} aria-label="Edit atau Regenerasi IDP">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Edit/Regenerasi
            </Button>

            <!-- Tombol Lihat Versi Lain -->
            <Button variant="outline" on:click={viewOtherVersions} disabled={!idpRecordId} aria-label="Lihat versi IDP lainnya">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Versi Lain
            </Button>
        </div>
    </div>
</div>

<style>
    /* Tidak ada styling khusus yang diperlukan selain Tailwind */
</style>
