// scripts/tests/testIDPGeneration.js
// Skrip mandiri untuk menguji fungsi generasi IDP dari idp.generator.js.

import logger from '$lib/server/utils/logger';
import { generateIDPDraft } from '$lib/server/ai/idp.generator';
import { findRelevantChunks } from '$lib/server/ai/knowledge.retriever';

/**
 * Fungsi untuk menguji generasi IDP dengan data profil dan chunk dummy.
 */
async function testIDPGeneration() {
    logger.info('[Test IDP Generation] Memulai pengujian fungsi generasi IDP...');

    // --- 1. Siapkan data profil dummy ---
    const dummyProfileData = {
        id: 'uuid-profil-test-123',
        nim: 'T987654321_TEST',
        nama_lengkap: 'Budi Santoso Test',
        nama_panggilan: 'Budi',
        departemen: 'Teknik Mesin',
        email: 'budi.santoso.test@example.com',
        jenis_kelamin: 'Laki-laki',
        tempat_lahir: 'Surabaya',
        agama: 'Islam',
        asal_sekolah: 'SMA Negeri 1 Surabaya',
        jalur_masuk: 'SNBT',
        username_telegram: '@budisantosotest',
        username_instagram: '@budisantoso_test',
        profil_riasec: {
            dominant_type: 'R',
            scores: { R: 25, I: 20, A: 10, S: 15, E: 20, C: 18 }
        },
        profil_vark: {
            dominant_style: 'Kinesthetic',
            scores: { Visual: 12, Auditory: 15, Reading: 18, Kinesthetic: 25 }
        },
        profil_minat_bidang: {
            dominant_interest: 'Manufaktur',
            scores: { Manufaktur: 5, Energi: 3, Otomotif: 4, Material: 2, Robotika: 4 }
        }
        // Tambahkan field lain jika diperlukan oleh idp.generator.js
    };

    // --- 2. Siapkan chunk pengetahuan dummy ---
    const dummyRelevantChunks = [
        {
            content: "Kurikulum Keprofesian Teknik Mesin ITS menekankan pengembangan keterampilan praktis dan teoritis. Bidang Manufaktur mencakup mata kuliah seperti Proses Manufaktur, Mesin Perkakas CNC, dan Otomasi Industri.",
            source: "Kurikulum Keprofesian Mahasiswa Teknik Mesin.docx",
            metadata: { section: "Bidang Minat", subsection: "Manufaktur" }
        },
        {
            content: "Rekomendasi pengembangan soft skill untuk mahasiswa teknik meliputi leadership, communication, dan teamwork. Kegiatan seperti HMTC, organisasi kemahasiswaan, dan proyek kelompok sangat dianjurkan.",
            source: "DRAF NEO PPSDM Keluarga Mahasiswa Mesin ITS.docx.pdf",
            metadata: { section: "Soft Skills", subsection: "Leadership & Communication" }
        },
        {
            content: "Minat di bidang Manufaktur cocok dengan tipe kepribadian RIASEC Realistic (R) dan Conventional (C). Kombinasi ini menunjukkan preferensi terhadap aktivitas fisik, kerja dengan alat, dan prosedur terstruktur.",
            source: "Analisis Psikometri Mahasiswa ITS",
            metadata: { section: "Analisis RIASEC-Manufaktur", subsection: "Korelasi" }
        }
        // Tambahkan chunk lain jika diperlukan untuk pengujian yang lebih kompleks
    ];

    // --- 3. (Opsional) Uji retrieval pengetahuan nyata ---
    // Anda bisa mengganti bagian ini dengan pemanggilan nyata ke findRelevantChunks
    // const retrievalResult = await findRelevantChunks("Buat IDP untuk minat di bidang Manufaktur", { topK: 3 });
    // if (retrievalResult.success) {
    //     dummyRelevantChunks = retrievalResult.data;
    // } else {
    //     logger.warn('[Test IDP Generation] Gagal melakukan retrieval pengetahuan nyata, menggunakan chunk dummy.', retrievalResult.error);
    // }

    try {
        // --- 4. Panggil fungsi generateIDPDraft ---
        logger.info('[Test IDP Generation] Memanggil generateIDPDraft dengan data dummy...');
        const generationOptions = {
            provider: 'CLAUDE', // Gunakan penyedia AI default
            model: 'anthropic/claude-3.5-sonnet:beta' // Gunakan model default
        };
        const result = await generateIDPDraft(dummyProfileData, dummyRelevantChunks, generationOptions);

        // --- 5. Evaluasi hasil ---
        if (result.success) {
            logger.info('[Test IDP Generation] Generasi IDP BERHASIL!');
            console.log('✅ Draft IDP berhasil dihasilkan:');
            console.log(JSON.stringify(result.data, null, 2)); // Tampilkan JSON yang diformat

            // --- 6. (Opsional) Simpan ke file untuk inspeksi manual ---
            // Anda bisa menggunakan fs untuk menyimpan ke file lokal jika diperlukan
            // import fs from 'fs/promises';
            // await fs.writeFile('test_idp_draft_output.json', JSON.stringify(result.data, null, 2));
            // logger.info('[Test IDP Generation] Draft IDP disimpan ke test_idp_draft_output.json untuk inspeksi.');

        } else {
            throw result.error || new Error(result.message);
        }

    } catch (error) {
        logger.error('[Test IDP Generation] Generasi IDP GAGAL:', error);
        console.error('❌ Gagal menghasilkan draft IDP:', error.message);
        process.exit(1); // Keluar dengan kode error
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    testIDPGeneration().catch(console.error);
}

export { testIDPGeneration };