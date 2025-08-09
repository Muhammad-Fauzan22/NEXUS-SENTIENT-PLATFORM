// src/routes/api/upload-idp-pdf/+server.js
// Endpoint API untuk menyimpan buffer PDF IDP ke Google Drive atau Supabase Storage.
// Menerima buffer PDF dan metadata dari endpoint /api/generate-idp.

import { json } from '@sveltejs/kit';
import logger from '$lib/server/utils/logger';
// --- 1. Impor fungsi utilitas Google Drive ---
import { uploadFileBuffer } from '$lib/server/utils/gdrive.utils'; // <<<<<<<<< GUNAKAN FUNGSI YANG SUDAH ADA
// --- 2. (Opsional) Impor Supabase Storage jika ingin backup atau alternatif ---
// import { supabaseAdmin } from '$lib/server/db/supabase.admin';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    logger.info('[API Upload IDP PDF] Menerima permintaan POST untuk menyimpan buffer PDF IDP.');

    let pdfBuffer;
    let metadata = {};

    // --- 3. Parsing JSON body ---
    try {
        const body = await request.json();
        pdfBuffer = body.pdfBuffer; // Buffer PDF dalam format base64 atau binary
        metadata = body.metadata || {}; // Metadata seperti idp_record_id, nim, nama_lengkap

        if (!pdfBuffer) {
            throw new Error('Buffer PDF tidak ditemukan dalam body request.');
        }

        // Jika pdfBuffer adalah string base64, konversi ke Buffer
        if (typeof pdfBuffer === 'string') {
            logger.debug('[API Upload IDP PDF] Mengonversi buffer PDF dari string base64 ke Buffer Node.js.');
            pdfBuffer = Buffer.from(pdfBuffer, 'base64');
        }

    } catch (parseError) {
        logger.error('[API Upload IDP PDF] Gagal mem-parsing body request JSON.', parseError);
        return json(
            { success: false, message: 'Invalid JSON in request body or missing pdfBuffer.' },
            { status: 400 } // Bad Request
        );
    }

    // --- 4. Validasi Metadata ---
    const { idp_record_id, nim, nama_lengkap } = metadata;
    if (!idp_record_id || !nim || !nama_lengkap) {
        logger.warn('[API Upload IDP PDF] Metadata tidak lengkap (idp_record_id, nim, nama_lengkap diperlukan).');
        return json(
            { success: false, message: 'Metadata tidak lengkap. Diperlukan: idp_record_id, nim, nama_lengkap.' },
            { status: 400 }
        );
    }

    // --- 5. Siapkan Nama File dan Folder ---
    const timestampPrefix = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const safeNim = nim.replace(/\//g, '_'); // Hindari karakter ilegal
    const fileName = `IDP_${safeNim}_${timestampPrefix}.pdf`;
    const folderName = `${timestampPrefix}_${safeNim}`; // Nama folder unik

    let gdriveFileId = null;
    let gdriveFileUrl = null;

    // --- 6. Upload Buffer PDF ke Google Drive ---
    try {
        logger.info(`[API Upload IDP PDF] Mengunggah buffer PDF ke Google Drive sebagai: ${fileName}`);
        
        const uploadResult = await uploadFileBuffer(pdfBuffer, fileName, folderName); // <<<<<<<<< GUNAKAN FUNGSI UTILITAS

        if (!uploadResult.success) {
            throw uploadResult.error || new Error(uploadResult.message);
        }

        gdriveFileId = uploadResult.data.fileId;
        gdriveFileUrl = uploadResult.data.webViewLink; // Atau webContentLink jika ingin direct download
        logger.info(`[API Upload IDP PDF] PDF berhasil diunggah ke Google Drive. File ID: ${gdriveFileId}, URL: ${gdriveFileUrl}`);

    } catch (uploadError) {
        logger.error(`[API Upload IDP PDF] Gagal mengunggah PDF ke Google Drive: ${uploadError.message}`, uploadError);
        return json(
            { success: false, message: `Failed to upload PDF to Google Drive: ${uploadError.message}` },
            { status: 500 } // Internal Server Error
        );
    }

    // --- 7. (Opsional) Simpan URL ke Database ---
    // Anda bisa memperbarui record idp_records dengan pdf_url
    // Misalnya:
    /*
    try {
        logger.info(`[API Upload IDP PDF] Memperbarui record IDP ${idp_record_id} dengan URL PDF dari Google Drive.`);
        const { error: updateError } = await supabaseAdmin
            .from('idp_records')
            .update({ pdf_url: gdriveFileUrl })
            .eq('id', idp_record_id);

        if (updateError) throw updateError;
        logger.info(`[API Upload IDP PDF] Record IDP ${idp_record_id} berhasil diperbarui dengan URL PDF.`);
    } catch (updateError) {
        logger.error(`[API Upload IDP PDF] Gagal memperbarui record IDP ${idp_record_id} dengan URL PDF: ${updateError.message}`, updateError);
        // Bisa diputuskan apakah ini error kritis atau tidak.
        // Untuk sekarang, kita log saja dan kembalikan sukses.
    }
    */

    // --- 8. Kembalikan Respons Sukses dengan URL File ---
    logger.info(`[API Upload IDP PDF] Seluruh proses upload PDF untuk ${nama_lengkap} (${nim}) berhasil.`);
    return json(

        {
            success: true,
            message: 'PDF IDP berhasil diunggah ke Google Drive.',
            // DIPERBAIKI: Objek berikut harus diberi key, misalnya 'data'
            data: {
                idp_record_id: idp_record_id,
                pdf_file_id: gdriveFileId,
                pdf_file_url: gdriveFileUrl,
                file_name: fileName
            }
        },
        { status: 201 } // Created
    );
}
