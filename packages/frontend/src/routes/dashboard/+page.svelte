<!-- src/routes/dashboard/+page.svelte -->
<!-- Halaman Dashboard untuk Menampilkan Daftar IDP -->

<script>
    import logger from '$lib/server/utils/logger';
    import IDPDashboard from '$lib/components/idp/IDPDashboard.svelte';

    /** @type {import('./$types').PageLoad} */
    export async function load({ url }) {
        logger.info('[Dashboard Page Load] Menerima permintaan untuk halaman dashboard.');

        // Ambil NIM dari parameter URL untuk pengujian
        // Contoh: http://localhost:5173/dashboard?nim=T987654321_FILE_TEST
        const nimFromUrl = url.searchParams.get('nim');

        if (!nimFromUrl) {
            logger.warn('[Dashboard Page Load] Parameter NIM tidak ditemukan di URL.');
            // Untuk produksi, redirect ke login atau halaman error
            // Untuk sekarang, lempar error halaman
            throw new Error('Parameter NIM (?nim=...) diperlukan untuk mengakses dashboard.');
        }

        logger.info(`[Dashboard Page Load] NIM ditemukan: ${nimFromUrl}`);
        return {
            nim: nimFromUrl
        };
    }
</script>

<script>
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="w-full min-h-screen bg-gray-100 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Dasbor Individual Development Plan (IDP) Saya</h1>
            <p class="mt-2 text-gray-600">
                Menampilkan daftar IDP untuk NIM: <span class="font-mono bg-gray-200 px-2 py-1 rounded">{data.nim}</span>
            </p>
        </header>
        <main>
            <IDPDashboard nim={data.nim} />
        </main>
    </div>
</div>
