<!-- src/lib/components/idp/IDPViewer.svelte -->
<!-- Komponen untuk Menampilkan Individual Development Plan (IDP) dalam format HTML -->

<script>
    // --- Impor ---
    // DIPERBAIKI: Mengimpor fungsi navigasi dan toast manager yang diperlukan.
    import { goto } from '$app/navigation';
    import { showError, showSuccess, showInfo } from '$lib/utils/toast.manager'; // Asumsi path toast manager

    import Button from '$lib/components/ui/Button.svelte';
    import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

    // --- Props ---
    /** @type {string} - String HTML dari IDP yang diformat. Diteruskan dari parent/page. */
    export let htmlContent = '';

    /** @type {string} - UUID dari record IDP di database. Diperlukan untuk mengunduh PDF dan aksi lainnya. */
    export let idpRecordId = '';

    /** @type {string} - Nama file untuk PDF (opsional, untuk UX). */
    export let fileName = 'IDP_Saya.pdf';

    // --- State ---
    // DIPERBAIKI: Menggunakan state Svelte standar yang kompatibel.
    let isDownloading = false;

    // --- Fungsi ---
    /**
     * Fungsi untuk memicu unduhan PDF IDP.
     */
    async function downloadPDF() {
        if (!idpRecordId) {
            console.warn('[IDP Viewer] IDP Record ID tidak tersedia, tidak dapat mengunduh PDF.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat mengunduh PDF.');
            return;
        }

        isDownloading = true;
        console.info(`[IDP Viewer] Memulai unduhan PDF untuk IDP Record ID: ${idpRecordId}`);

        try {
            const downloadUrl = `/api/download-idp-pdf?id=${encodeURIComponent(idpRecordId)}`;
            console.debug(`[IDP Viewer] URL unduhan PDF yang dibangun: ${downloadUrl}`);
            window.location.href = downloadUrl;
            console.info('[IDP Viewer] Permintaan unduhan PDF dikirim ke browser.');
        } catch (error) {
            const errorMsg = `Gagal memicu unduhan PDF: ${error.message}`;
            console.error(`[IDP Viewer] downloadPDF FAILED: ${errorMsg}`, error);
            showError(errorMsg);
        } finally {
            // Matikan loading segera karena browser menangani unduhan secara terpisah.
            isDownloading = false;
        }
    }

    /**
     * Fungsi untuk menyalin tautan IDP ke clipboard.
     */
    async function copyShareLink() {
        if (!idpRecordId) {
            console.warn('[IDP Viewer] IDP Record ID tidak tersedia, tidak dapat menyalin tautan.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat menyalin tautan.');
            return;
        }

        // DIPERBAIKI: Deklarasikan shareUrl di luar try-catch agar bisa diakses di catch block.
        let shareUrl = '';
        try {
            shareUrl = `${window.location.origin}/idp/${idpRecordId}`;
            console.debug(`[IDP Viewer] URL berbagi yang dibangun: ${shareUrl}`);

            await navigator.clipboard.writeText(shareUrl);
            console.info(`[IDP Viewer] Tautan IDP berhasil disalin ke clipboard: ${shareUrl}`);
            showSuccess('Tautan IDP berhasil disalin ke clipboard!');

        } catch (error) {
            const errorMsg = `Gagal menyalin tautan IDP: ${error.message}`;
            console.error(`[IDP Viewer] copyShareLink FAILED: ${errorMsg}`, error);
            showInfo(`Gagal menyalin otomatis. Salin tautan berikut: ${shareUrl}`);
        }
    }

    /**
     * Fungsi untuk mengarahkan ke halaman edit/regenerasi IDP.
     */
    function editIDP() {
        if (!idpRecordId) {
            console.warn('[IDP Viewer] IDP Record ID tidak tersedia, tidak dapat mengedit.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat mengedit.');
            return;
        }
        console.info(`[IDP Viewer] Mengarahkan ke halaman edit/regenerasi IDP untuk ID: ${idpRecordId}`);
        goto(`/dashboard/${idpRecordId}/review`); // Menggunakan goto yang sudah diimpor
    }

    /**
     * Fungsi untuk menampilkan daftar versi IDP lainnya (placeholder).
     */
    function viewOtherVersions() {
        if (!idpRecordId) {
            console.warn('[IDP Viewer] IDP Record ID tidak tersedia, tidak dapat melihat versi lain.');
            showError('IDP Record ID tidak ditemukan. Tidak dapat melihat versi lain.');
            return;
        }
        console.info(`[IDP Viewer] Menampilkan daftar versi IDP lainnya untuk ID: ${idpRecordId}`);
        showInfo('Fitur "Lihat Versi Lain" akan segera hadir!');
    }
</script>

<div class="flex flex-col h-full bg-gray-100">
    <!-- Toolbar Atas -->
    <div class="flex-shrink-0 p-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold text-gray-800">Individual Development Plan (IDP) Anda</h1>
            <div class="flex flex-wrap items-center gap-2">
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

                <!-- Tombol Unduh PDF -->
                <Button variant="primary" on:click={downloadPDF} disabled={isDownloading || !idpRecordId} aria-label="Unduh IDP sebagai PDF">
                    {#if isDownloading}
                        <LoadingSpinner size="sm" color="white" text="Mengunduh..." />
                    {:else}
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Unduh sebagai PDF
                    {/if}
                </Button>
            </div>
        </div>
    </div>

    <!-- Kontainer Konten IDP dengan Scroll -->
    <div class="flex-grow overflow-auto p-4 bg-gray-50">
        {#if htmlContent}
            <!-- Konten HTML dirender di sini. Styling ditangani oleh blok <style> di bawah. -->
            <div class="idp-content-container">
                {@html htmlContent}
            </div>
        {:else}
            <div class="flex-grow flex items-center justify-center p-4">
                <div class="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <h2 class="text-2xl font-bold text-red-600 mb-4">Ups!</h2>
                    <p class="text-gray-700 mb-4">Terjadi kesalahan saat memuat konten IDP.</p>
                    <p class="text-sm text-gray-500">(Konten IDP tidak tersedia.)</p>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    /* --- Scoped Styles untuk IDPViewer --- */
    /* Kontainer utama untuk konten IDP */
    .idp-content-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        background-color: #ffffff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        max-width: 800px;
        margin: 0 auto;
    }

    /* --- Styling Global untuk Konten di Dalam {@html ...} --- */
    /* DIPERBAIKI: Menggunakan :global() agar style dapat menargetkan elemen di dalam {@html} */

    .idp-content-container :global(h1) {
        font-size: 2rem;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 1.5rem;
        text-align: center;
        border-bottom: 2px solid #4299e1;
        padding-bottom: 0.5rem;
    }

    .idp-content-container :global(h2) {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2b6cb0;
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-left: 4px solid #4299e1;
        padding-left: 1rem;
    }

    .idp-content-container :global(h3) {
        font-size: 1.25rem;
        font-weight: 600;
        color: #4a5568;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
    }

    .idp-content-container :global(p) {
        margin-bottom: 1rem;
    }

    .idp-content-container :global(ul),
    .idp-content-container :global(ol) {
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }

    .idp-content-container :global(li) {
        margin-bottom: 0.5rem;
    }

    .idp-content-container :global(table) {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .idp-content-container :global(th),
    .idp-content-container :global(td) {
        border: 1px solid #cbd5e0;
        padding: 0.75rem;
        text-align: left;
        vertical-align: top;
    }

    .idp-content-container :global(th) {
        background-color: #ebf8ff;
        font-weight: 600;
        color: #2d3748;
        text-transform: uppercase;
        font-size: 0.875rem;
    }

    .idp-content-container :global(tr:nth-child(even)) {
        background-color: #f7fafc;
    }

    .idp-content-container :global(tr:hover) {
        background-color: #edf2f7;
    }

    .idp-content-container :global(a) {
        color: #3182ce;
        text-decoration: underline;
    }

    .idp-content-container :global(a:hover) {
        color: #2c5282;
    }

    /* Style untuk class khusus dari formatter */
    .idp-content-container :global(.idp-highlight) {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: 500;
    }

    .idp-content-container :global(.idp-section-box) {
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        background-color: #f8f9fa;
    }
</style>