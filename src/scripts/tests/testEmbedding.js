// src/scripts/tests/testEmbedding.js
// Skrip pengujian mandiri untuk menguji fungsi embedding dan menyimpan buffer PDF ke Google Drive/Supabase Storage.

import fs from 'fs/promises';
import path from 'path';
import logger from '$lib/server/utils/logger';
import { generateEmbedding } from '$lib/server/ai/embedding.utils';
import { uploadFileBuffer } from '$lib/server/utils/gdrive.utils';

/**
 * Fungsi utama untuk menjalankan pengujian embedding dan penyimpanan buffer PDF.
 */
async function runTest() {
    logger.info('[Test Embedding Script] Memulai pengujian fungsi embedding dan penyimpanan buffer PDF...');

    const dummyText = "Ini adalah teks dummy untuk pengujian fungsi embedding. Teks ini akan diubah menjadi vektor numerik.";
    const dummyPdfContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<</Type /Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type /Pages/Kids [3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type /Page/Parent 2 0 R/MediaBox [0 0 612 792]/Contents 4 0 R/Resources <</Font <</F1 5 0 R>>>>>>\nendobj\n4 0 obj\n<</Length 44>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Dummy PDF Content for Testing) Tj\nET\nendstream\nendobj\n5 0 obj\n<</Type /Font/Subtype /Type1/BaseFont /Helvetica>>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000015 00000 n \n0000000060 00000 n \n0000000111 00000 n \n0000000215 00000 n \n0000000291 00000 n \ntrailer\n<</Size 6/Root 1 0 R>>\nstartxref\n348\n%%EOF`;
    const dummyPdfBuffer = Buffer.from(dummyPdfContent, 'binary');
    const timestampPrefix = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    let embeddingVector;

    // --- Uji fungsi embedding ---
    try {
        logger.info('[Test Embedding Script] Menghasilkan embedding untuk teks dummy...');
        const embeddingResult = await generateEmbedding({ input: dummyText }, { provider: 'DEEPSEEK' });

        if (!embeddingResult.success || !embeddingResult.data) {
            throw embeddingResult.error || new Error('Hasil embedding tidak valid atau kosong.');
        }

        embeddingVector = embeddingResult.data;
        logger.info(`[Test Embedding Script] Embedding berhasil dihasilkan. Dimensi: ${embeddingVector.length}`);
    } catch (embeddingError) {
        logger.error(`[Test Embedding Script] Gagal menghasilkan embedding: ${embeddingError.message}`, embeddingError);
        process.exit(1);
    }

    // --- Simpan buffer PDF ke Google Drive ---
    try {
        logger.info('[Test Embedding Script] Menyimpan buffer PDF dummy ke Google Drive...');
        const fileName = `Test_Embedding_PDF_Buffer_${timestampPrefix}.pdf`;
        const folderName = `Test_NEXUS_Embedding_Buffers_${timestampPrefix}`;
        const uploadResult = await uploadFileBuffer(dummyPdfBuffer, fileName, folderName);

        if (!uploadResult.success || !uploadResult.data) {
            throw uploadResult.error || new Error('Hasil upload tidak valid atau kosong.');
        }

        const { fileId, webViewLink } = uploadResult.data;
        logger.info(`[Test Embedding Script] Buffer PDF dummy berhasil diunggah ke Google Drive.`);
        logger.info(`[Test Embedding Script] File ID: ${fileId}`);
        logger.info(`[Test Embedding Script] Link Akses: ${webViewLink}`);

        const fileInfo = { fileName, fileId, webViewLink, uploadedAt: new Date().toISOString(), fileSizeBytes: dummyPdfBuffer.length };
        const fileInfoPath = path.join(process.cwd(), 'src', 'scripts', 'tests', `uploaded_pdf_buffer_info_${timestampPrefix}.json`);
        await fs.writeFile(fileInfoPath, JSON.stringify(fileInfo, null, 2));
        logger.info(`[Test Embedding Script] Informasi file diunggah disimpan di: ${fileInfoPath}`);
    } catch (uploadError) {
        logger.error(`[Test Embedding Script] Gagal menyimpan buffer PDF ke Google Drive: ${uploadError.message}`, uploadError);
        process.exit(1);
    }

    // --- Simpan embedding ke file lokal ---
    try {
        logger.info('[Test Embedding Script] Menyimpan embedding ke file lokal untuk referensi...');
        const embeddingInfo = { text: dummyText, embedding: embeddingVector, generatedAt: new Date().toISOString() };
        const embeddingInfoPath = path.join(process.cwd(), 'src', 'scripts', 'tests', `generated_embedding_${timestampPrefix}.json`);
        await fs.writeFile(embeddingInfoPath, JSON.stringify(embeddingInfo, null, 2));
        logger.info(`[Test Embedding Script] Embedding disimpan di: ${embeddingInfoPath}`);
    } catch (saveEmbeddingError) {
        logger.error(`[Test Embedding Script] Gagal menyimpan embedding ke file lokal: ${saveEmbeddingError.message}`, saveEmbeddingError);
    }

    logger.info('[Test Embedding Script] Pengujian selesai dengan sukses.');
}

if (require.main === module) {
    runTest().catch(console.error);
}

export { runTest };