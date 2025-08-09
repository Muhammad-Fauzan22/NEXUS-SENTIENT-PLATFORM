// src/routes/api/download-idp-pdf/+server.js
// Endpoint API untuk mengunduh Individual Development Plan (IDP) sebagai file PDF.
// Mengambil html_content dari database dan mengonversinya ke PDF menggunakan html-pdf.

import { json } from '@sveltejs/kit'; // Untuk response JSON error
import logger from '$lib/server/utils/logger';
import { supabaseAdmin } from '$lib/server/db/supabase.admin'; // Akses database dengan hak admin
import htmlPdf from 'html-pdf'; // Library untuk konversi HTML ke PDF
import { promisify } from 'util'; // Untuk mengubah html-pdf.create menjadi Promise

// --- Promisify html-pdf.create ---
// html-pdf.create menggunakan callback. Kita ubah menjadi Promise untuk kemudahan penggunaan async/await.
const createPdf = promisify(htmlPdf.create);

// --- Konfigurasi PDF ---
// Opsi konfigurasi untuk html-pdf
const PDF_OPTIONS = {
    format: 'A4',
    orientation: 'portrait',
    border: {
        "top": "1.5cm",
        "right": "1.5cm",
        "bottom": "1.5cm",
        "left": "1.5cm"
    },
    // header: { ... }, // Bisa ditambahkan jika diperlukan
    // footer: { ... }, // Bisa ditambahkan jika diperlukan
    timeout: 30000 // Timeout 30 detik
};

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    logger.info('[API Download IDP PDF] Menerima permintaan GET untuk mengunduh IDP PDF.');

    // --- 1. Ambil parameter ID dari URL ---
    const idpRecordId = url.searchParams.get('id');

    if (!idpRecordId) {
        logger.warn('[API Download IDP PDF] Parameter ID (idp_record_id) tidak ditemukan.');
        return json(
            { success: false, message: 'Parameter ID (idp_record_id) diperlukan. Contoh: ?id=uuid_record_anda' },
            { status: 400 } // Bad Request
        );
    }

    let idpRecord;

    // --- 2. Ambil record IDP dari database ---
    try {
        logger.info(`[API Download IDP PDF] Mencari record IDP dengan ID: ${idpRecordId}`);
        const { data, error: dbError } = await supabaseAdmin
            .from('idp_records')
            .select('id, html_content, processed_profile_id') // Pilih field yang dibutuhkan
            .eq('id', idpRecordId)
            .single(); // Karena ID adalah UUID unik

        if (dbError) {
            logger.error(`[API Download IDP PDF] Gagal mengambil record IDP dari database: ${dbError.message}`, dbError);
            // Tangani error khusus "not found"
            if (dbError.code === 'PGRST116' || dbError.message?.includes('Results contain 0 rows')) {
                 logger.warn(`[API Download IDP PDF] Record IDP dengan ID ${idpRecordId} tidak ditemukan.`);
                 return json(
                    { success: false, message: 'IDP record tidak ditemukan.' },
                    { status: 404 } // Not Found
                );
            }
            throw dbError; // Lempar error lainnya
        }

        if (!data) {
            logger.warn(`[API Download IDP PDF] Record IDP dengan ID ${idpRecordId} tidak ditemukan (data null).`);
            return json(
                { success: false, message: 'IDP record tidak ditemukan.' },
                { status: 404 }
            );
        }

        idpRecord = data;
        logger.info(`[API Download IDP PDF] Record IDP ditemukan.`);

    } catch (fetchError) {
        logger.error(`[API Download IDP PDF] Gagal mengambil record IDP: ${fetchError.message}`, fetchError);
        return json(
            { success: false, message: `Gagal mengambil data IDP: ${fetchError.message}` },
            { status: 500 } // Internal Server Error
        );
    }

    // --- 3. Validasi html_content ---
    const htmlContent = idpRecord.html_content;

    if (!htmlContent) {
        logger.warn(`[API Download IDP PDF] Record IDP ${idpRecordId} tidak memiliki html_content.`);
        return json(
            { success: false, message: 'File PDF IDP tidak tersedia untuk record ini. Konten HTML belum dibuat atau gagal disimpan.' },
            { status: 404 }
        );
    }

    // --- 4. Konversi HTML ke PDF ---
    let pdfBuffer;
    try {
        logger.info('[API Download IDP PDF] Memulai konversi HTML ke PDF...');
        
        // Gunakan createPdf yang sudah dipromisify
        const pdfDoc = createPdf(htmlContent, PDF_OPTIONS);

        // Konversi ke buffer
        pdfBuffer = await pdfDoc.toBuffer();

        logger.info('[API Download IDP PDF] Konversi HTML ke PDF berhasil.');

    } catch (conversionError) {
        logger.error('[API Download IDP PDF] Gagal mengonversi HTML ke PDF:', conversionError);
        return json(
            { success: false, message: `Gagal membuat file PDF: ${conversionError.message}` },
            { status: 500 }
        );
    }

    // --- 5. Siapkan nama file untuk unduhan ---
    // Anda bisa mendapatkan NIM dari `processed_profile_id` jika perlu nama file lebih deskriptif
    // Untuk sekarang, kita gunakan ID record.
    const fileName = `IDP_${idpRecordId}.pdf`; // Atau buat nama kustom, misal: `IDP_NIM_${nim}.pdf`

    // --- 6. Kembalikan response dengan file PDF ---
    logger.info(`[API Download IDP PDF] Mengirim file PDF sebagai response.`);
    return new Response(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`, // Memaksa unduh
            'Content-Length': pdfBuffer.length.toString()
            // Cache-Control bisa ditambahkan jika diperlukan
        }
    });
}

// --- Catatan Penting ---
// Endpoint ini mengasumsikan `html_content` adalah string HTML dari IDP yang diformat.
// Pastikan `idp.formatter.js` menghasilkan HTML yang sesuai.
// Jika terjadi error "PhantomJS not found" atau sejenisnya, pastikan `html-pdf`
// dan dependensinya (`phantomjs-prebuilt`) terinstal dengan benar.
// Pertimbangkan untuk menggunakan Puppeteer jika `html-pdf` bermasalah di lingkungan produksi.