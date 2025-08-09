// src/scripts/tests/test.js
// Skrip pengujian mandiri untuk menyimpan buffer PDF yang dihasilkan oleh idp.pdf.generator.js ke Google Drive.
// Jalankan dengan: node src/scripts/tests/test.js

import fs from 'fs/promises';
import path from 'path';
import logger from '$lib/server/utils/logger';
// --- 1. Impor fungsi yang diperlukan ---
import { generateIDPPDFBuffer } from '$lib/server/ai/idp.pdf.generator'; // <<<<<<<<< IMPOR
import { uploadFileBuffer } from '$lib/server/utils/gdrive.utils'; // <<<<<<<<< IMPOR (Fungsi untuk upload buffer ke GDrive)

/**
 * Fungsi utama untuk menjalankan pengujian.
 */
async function runTest() {
    logger.info('[Test Script] Memulai pengujian penyimpanan buffer PDF ke Google Drive...');

    // --- 2. Siapkan HTML konten dummy untuk diuji ---
    const dummyHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test IDP PDF</title>
        <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: blue; }
        </style>
    </head>
    <body>
        <h1>Individual Development Plan (IDP) - Test</h1>
        <p>Ini adalah dokumen IDP dummy yang dihasilkan untuk tujuan pengujian.</p>
        <ul>
            <li>List Item 1</li>
            <li>List Item 2</li>
        </ul>
    </body>
    </html>
    `;

    let pdfBuffer;

    // --- 3. Hasilkan buffer PDF dari HTML dummy ---
    try {
        logger.info('[Test Script] Menghasilkan buffer PDF dari HTML dummy...');
        const bufferResult = await generateIDPPDFBuffer(dummyHtmlContent, {
            fileName: 'Test_IDP_Buffer.pdf'
        });

        if (!bufferResult.success) {
            throw bufferResult.error || new Error(bufferResult.message);
        }

        pdfBuffer = bufferResult.data; // <<<<<<<<< BUFFER PDF DIPEROLEH
        logger.info(`[Test Script] Buffer PDF berhasil dihasilkan. Ukuran: ${pdfBuffer.length} bytes.`);

    } catch (bufferError) {
        logger.error(`[Test Script] Gagal menghasilkan buffer PDF: ${bufferError.message}`, bufferError);
        process.exit(1);
    }

    // --- 4. Simpan buffer PDF ke Google Drive ---
    try {
        logger.info('[Test Script] Menyimpan buffer PDF ke Google Drive...');

        // Siapkan nama file dan folder
        const timestampPrefix = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `Test_IDP_Buffer_${timestampPrefix}.pdf`;
        const folderName = `Test_NEXUS_IDP_Buffers_${timestampPrefix}`; // Nama folder unik untuk test ini

        // Panggil fungsi upload buffer
        const uploadResult = await uploadFileBuffer(pdfBuffer, fileName, folderName); // <<<<<<<<< GUNAKAN FUNGSI UPLOAD BUFFER

        if (!uploadResult.success) {
            throw uploadResult.error || new Error(uploadResult.message);
        }

        const fileId = uploadResult.data.fileId;
        const webViewLink = uploadResult.data.webViewLink;
        logger.info(`[Test Script] Buffer PDF berhasil diunggah ke Google Drive.`);
        logger.info(`[Test Script] File ID: ${fileId}`);
        logger.info(`[Test Script] Link Akses: ${webViewLink}`);

        // --- 5. (Opsional) Simpan informasi file ke file lokal untuk referensi ---
        const fileInfo = {
            fileName: fileName,
            fileId: fileId,
            webViewLink: webViewLink,
            uploadedAt: new Date().toISOString(),
            fileSizeBytes: pdfBuffer.length
        };
        const fileInfoPath = path.join(process.cwd(), 'src', 'scripts', 'tests', `uploaded_pdf_info_${timestampPrefix}.json`);
        await fs.writeFile(fileInfoPath, JSON.stringify(fileInfo, null, 2));
        logger.info(`[Test Script] Informasi file diunggah disimpan di: ${fileInfoPath}`);

    } catch (uploadError) {
        logger.error(`[Test Script] Gagal menyimpan buffer PDF ke Google Drive: ${uploadError.message}`, uploadError);
        process.exit(1);
    }

    logger.info('[Test Script] Pengujian penyimpanan buffer PDF ke Google Drive selesai dengan sukses.');
}

// --- 6. Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runTest().catch(console.error);
}

// --- 7. Eksport fungsi untuk digunakan oleh skrip lain ---
export { runTest };