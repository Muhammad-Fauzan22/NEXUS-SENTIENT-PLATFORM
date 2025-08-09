// src/scripts/tests/testPDFGeneration.js
// Skrip pengujian mandiri untuk menguji fungsi pembuatan PDF menggunakan html-pdf.
// Menggunakan htmlContent dummy dan idp.pdf.generator.js untuk menghasilkan buffer PDF.
// Jalankan dengan: node src/scripts/tests/testPDFGeneration.js

import fs from 'fs/promises';
import path from 'path';
import logger from '$lib/server/utils/logger';
// --- 1. Impor fungsi yang diperlukan ---
import { generateIDPPDFBuffer } from '$lib/server/ai/idp.pdf.generator'; // <<<<<<<<< IMPOR FUNGSI PEMBUATAN BUFFER PDF

/**
 * Fungsi utama untuk menjalankan pengujian pembuatan PDF.
 */
async function runTest() {
    logger.info('[Test PDF Generation Script] Memulai pengujian fungsi generateIDPPDFBuffer...');

    // --- 2. Siapkan HTML konten dummy untuk diuji ---
    // Gunakan HTML yang mirip dengan output dari idp.formatter.js
    const dummyHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test IDP PDF</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 2cm; }
            h1 { color: #004b87; border-bottom: 2px solid #4299e1; padding-bottom: 0.5rem; }
            .section { margin-bottom: 1.5rem; }
            .profile-info { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
            .profile-box { border: 1px solid #cbd5e0; padding: 0.75rem; border-radius: 0.5rem; background-color: #f8f9fa; }
            table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
            th, td { border: 1px solid #cbd5e0; padding: 0.5rem; text-align: left; }
            th { background-color: #ebf8ff; }
        </style>
    </head>
    <body>
        <h1>Individual Development Plan (IDP) - Test</h1>
        <div class="section">
            <h2>Informasi Mahasiswa</h2>
            <div class="profile-info">
                <div class="profile-box"><strong>Nama:</strong> Budi Santoso</div>
                <div class="profile-box"><strong>NIM:</strong> T987654321_TEST</div>
                <div class="profile-box"><strong>Departemen:</strong> Teknik Mesin</div>
            </div>
        </div>
        <div class="section">
            <h2>Rencana Pengembangan</h2>
            <p>Ini adalah draft IDP dummy yang dihasilkan untuk tujuan pengujian.</p>
            <table>
                <thead>
                    <tr><th>Semester</th><th>Fokus</th></tr>
                </thead>
                <tbody>
                    <tr><td>Semester 1 & 2</td><td>Menguasai dasar-dasar teknik mesin</td></tr>
                    <tr><td>Semester 3 & 4</td><td>Mengikuti mata kuliah pilihan minat</td></tr>
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;

    let pdfBuffer;

    // --- 3. Uji fungsi generateIDPPDFBuffer ---
    try {
        logger.info('[Test PDF Generation Script] Memanggil generateIDPPDFBuffer dengan HTML dummy...');
        
        const bufferResult = await generateIDPPDFBuffer(dummyHtmlContent, {
            fileName: 'Test_IDP_Dummy.pdf' // Nama file opsional untuk metadata
        });

        if (!bufferResult.success) {
            throw bufferResult.error || new Error(bufferResult.message);
        }

        pdfBuffer = bufferResult.data; // <<<<<<<<< BUFFER PDF DIPEROLEH
        logger.info(`[Test PDF Generation Script] Buffer PDF berhasil dihasilkan. Ukuran: ${pdfBuffer.length} bytes.`);

    } catch (bufferError) {
        logger.error(`[Test PDF Generation Script] Gagal menghasilkan buffer PDF: ${bufferError.message}`, bufferError);
        process.exit(1);
    }

    // --- 4. Simpan buffer PDF ke file lokal untuk verifikasi ---
    try {
        logger.info('[Test PDF Generation Script] Menyimpan buffer PDF ke file lokal untuk verifikasi...');

        const timestampPrefix = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const outputFileName = `Test_IDP_PDF_Buffer_${timestampPrefix}.pdf`;
        const outputPath = path.join(process.cwd(), 'src', 'scripts', 'tests', outputFileName);

        // Pastikan folder output ada
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        await fs.writeFile(outputPath, pdfBuffer);
        logger.info(`[Test PDF Generation Script] Buffer PDF berhasil disimpan ke: ${outputPath}`);

    } catch (saveError) {
        logger.error(`[Test PDF Generation Script] Gagal menyimpan buffer PDF ke file lokal: ${saveError.message}`, saveError);
        // Jangan hentikan proses hanya karena ini
    }

    logger.info('[Test PDF Generation Script] Pengujian fungsi generateIDPPDFBuffer selesai dengan sukses.');
}

// --- 5. Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runTest().catch(console.error);
}

// --- 6. Eksport fungsi untuk digunakan oleh skrip lain ---
export { runTest };