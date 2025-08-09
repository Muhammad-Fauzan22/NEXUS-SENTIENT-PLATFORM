// src/routes/api/generate-idp/+server.js
// Endpoint API untuk menerima data asesmen, memprosesnya, menghasilkan IDP lengkap (JSON & HTML),
// menyimpannya ke database, dan mengembalikan ID record IDP untuk navigasi frontend.
// Diperbarui di Langkah 78 untuk mengintegrasikan buffer PDF yang dihasilkan oleh idp.pdf.generator.js.

import { json } from '@sveltejs/kit';
import logger from '$lib/server/utils/logger';
import { supabaseAdmin } from '$lib/server/db/supabase.admin'; // Akses database dengan hak admin
import { processRawAssessmentData } from '$lib/server/utils/assessment.processor';
import { findRelevantChunks } from '$lib/server/ai/knowledge.retriever';
import { generateIDPDraft } from '$lib/server/ai/idp.generator';
import { formatIDPToHTML } from '$lib/server/ai/idp.formatter';
// --- 1. Impor fungsi untuk menghasilkan buffer PDF ---
import { generateIDPPDFBuffer } from '$lib/server/ai/idp.pdf.generator'; // <<<<<<<<< TAMBAHKAN INI

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    logger.info('[API Generate IDP] Menerima permintaan POST multipart/form-data untuk pembuatan IDP.');

    let formData;
    let assessmentData = {};

    // --- 2. Parsing FormData ---
    try {
        formData = await request.formData();
    } catch (parseError) {
        logger.error('[API Generate IDP] Gagal mem-parsing FormData dari request.', parseError);
        return json(
            { success: false, message: 'Invalid FormData in request.' },
            { status: 400 } // Bad Request
        );
    }

    // --- 3. Pisahkan Field Data dan File ---
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            // File akan ditangani oleh sistem penyimpanan (misalnya, Google Drive)
            // Untuk sekarang, kita abaikan file dalam logika ini dan fokus pada data teks.
            // Anda bisa menyimpan metadata file (nama, ukuran) jika diperlukan.
            logger.debug(`[API Generate IDP] File ditemukan: ${key} (${value.name}, ${value.size} bytes) - DIAbaIKAN dalam logika ini.`);
        } else {
            // Ini adalah field teks. FormData selalu mengembalikan string untuk field teks.
            assessmentData[key] = value;
        }
    }

    // --- 4. Validasi Field Kunci ---
    if (!assessmentData.nim || !assessmentData.nama_lengkap) {
        logger.warn('[API Generate IDP] Field wajib (nim, nama_lengkap) tidak ditemukan.');
        return json(
            { success: false, message: 'Missing required fields: nim, nama_lengkap.' },
            { status: 400 }
        );
    }

    // --- 5. Simpan Data Mentah ke Database ---
    let rawAssessmentResult;
    try {
        logger.info(`[API Generate IDP] Menyimpan data mentah untuk NIM: ${assessmentData.nim}`);
        rawAssessmentResult = await saveRawAssessment(assessmentData);

        if (!rawAssessmentResult.success) {
            throw rawAssessmentResult.error || new Error(rawAssessmentResult.message);
        }

        logger.info(`[API Generate IDP] Data mentah berhasil disimpan dengan ID: ${rawAssessmentResult.data.id}`);

    } catch (saveError) {
        logger.error(`[API Generate IDP] Gagal menyimpan data mentah untuk NIM ${assessmentData.nim}:`, saveError);
        return json(
            { success: false, message: `Failed to save raw assessment  ${saveError.message}` },
            { status: 500 } // Internal Server Error
        );
    }

    // --- 6. Proses Data Mentah menjadi Profil ---
    let processedProfileData;
    try {
        logger.info(`[API Generate IDP] Memproses data mentah ID: ${rawAssessmentResult.data.id}`);
        const processResult = await processRawAssessmentData(rawAssessmentResult.data);

        if (!processResult.success) {
            throw processResult.error || new Error(processResult.message);
        }

        processedProfileData = processResult.data;
        logger.info(`[API Generate IDP] Data mentah berhasil diproses.`);

    } catch (processError) {
        logger.error(`[API Generate IDP] Gagal memproses data mentah ID ${rawAssessmentResult.data.id}:`, processError);
        return json(
            { success: false, message: `Failed to process assessment  ${processError.message}` },
            { status: 500 }
        );
    }

    // --- 7. Simpan Profil yang Diproses ke Database ---
    processedProfileData.raw_assessment_id = rawAssessmentResult.data.id;

    let processedProfileResult;
    try {
        logger.info(`[API Generate IDP] Menyimpan profil yang diproses untuk NIM: ${processedProfileData.nim}`);
        processedProfileResult = await saveProcessedProfile(processedProfileData);

        if (!processedProfileResult.success) {
            throw processedProfileResult.error || new Error(processedProfileResult.message);
        }

        logger.info(`[API Generate IDP] Profil yang diproses berhasil disimpan dengan ID: ${processedProfileResult.data.id}`);

    } catch (saveProfileError) {
        logger.error(`[API Generate IDP] Gagal menyimpan profil yang diproses untuk NIM ${processedProfileData.nim}:`, saveProfileError);
        return json(
            { success: false, message: `Failed to save processed profile: ${saveProfileError.message}` },
            { status: 500 }
        );
    }

    // --- 8. (Opsional) Cari Chunk Pengetahuan Relevan ---
    const dominantInterest = processedProfileData.profil_minat_bidang?.dominant_interest || 'umum';
    const dominantRIASEC = processedProfileData.profil_riasec?.dominant_type || 'R';
    const retrievalQuery = `Buat IDP untuk minat di bidang ${dominantInterest} berdasarkan tipe RIASEC ${dominantRIASEC}.`;

    let relevantChunks = [];
    try {
        logger.info(`[API Generate IDP] Mencari pengetahuan relevan untuk query: "${retrievalQuery}"`);
        const retrievalOptions = {
            topK: 5, // Ambil 5 chunk teratas
            minSimilarity: 0.2, // Threshold kesamaan
            provider: 'DEEPSEEK' // Penyedia AI untuk embedding query
        };
        const retrievalResult = await findRelevantChunks(retrievalQuery, retrievalOptions);

        if (!retrievalResult.success) {
            // Log error tetapi jangan hentikan proses. IDP tetap bisa dibuat tanpa pengetahuan eksternal.
            logger.warn(`[API Generate IDP] Gagal melakukan retrieval pengetahuan: ${retrievalResult.error?.message || retrievalResult.message}`);
        } else {
            relevantChunks = retrievalResult.data || [];
            logger.info(`[API Generate IDP] Ditemukan ${relevantChunks.length} chunk pengetahuan yang relevan.`);
        }

    } catch (retrievalError) {
        logger.error(`[API Generate IDP] Error tidak tertangkap saat melakukan retrieval:`, retrievalError);
        // Tetap lanjutkan, relevantChunks akan kosong
    }

    // --- 9. Hasilkan Draft IDP ---
    let idpDraft;
    try {
        logger.info(`[API Generate IDP] Menghasilkan draft IDP untuk: ${processedProfileData.nama_lengkap} (${processedProfileData.nim})`);
        const generationOptions = {
            provider: 'CLAUDE', // Gunakan Claude untuk generasi teks kompleks
            // model: 'anthropic/claude-3.5-sonnet:beta' // Bisa spesifik model jika diperlukan
        };
        const generationResult = await generateIDPDraft(processedProfileData, relevantChunks, generationOptions);

        if (!generationResult.success) {
            throw generationResult.error || new Error(generationResult.message);
        }

        idpDraft = generationResult.data;
        logger.info(`[API Generate IDP] Draft IDP berhasil dihasilkan.`);

    } catch (generationError) {
        logger.error(`[API Generate IDP] Gagal menghasilkan draft IDP: ${generationError.message}`, generationError);
        return json(
            { success: false, message: `Failed to generate IDP draft: ${generationError.message}` },
            { status: 500 }
        );
    }

    // --- 10. Format Draft IDP ke HTML ---
    let idpHTML = null;
    try {
        logger.info(`[API Generate IDP] Memformat draft IDP ke HTML...`);
        const formatResult = await formatIDPToHTML(idpDraft);

        if (!formatResult.success) {
            throw formatResult.error || new Error(formatResult.message);
        }

        idpHTML = formatResult.data;
        logger.info(`[API Generate IDP] Draft IDP berhasil diformat ke HTML.`);

    } catch (formatError) {
        // Jika formatting gagal, log error tapi jangan hentikan proses.
        // Kita tetap bisa menyimpan IDP JSON.
        logger.error(`[API Generate IDP] Gagal memformat IDP ke HTML (akan disimpan sebagai JSON saja): ${formatError.message}`, formatError);
        // idpHTML tetap null
    }

    // --- 11. (Langkah 78 - TAMBAHAN) Hasilkan Buffer PDF dari HTML ---
    let idpPDFBuffer = null;
    let idpPDFBufferError = null;
    if (idpHTML) {
        try {
            logger.info(`[API Generate IDP] Menghasilkan buffer PDF dari HTML IDP...`);
            // --- GUNAKAN FUNGSI BARU DARI idp.pdf.generator.js ---
            const pdfBufferResult = await generateIDPPDFBuffer(idpHTML, {
                fileName: `IDP_${processedProfileData.nim}_${Date.now()}.pdf` // Nama file opsional untuk metadata
            });

            if (!pdfBufferResult.success) {
                throw pdfBufferResult.error || new Error(pdfBufferResult.message);
            }

            idpPDFBuffer = pdfBufferResult.data; // Buffer PDF yang dihasilkan
            logger.info(`[API Generate IDP] Buffer PDF IDP berhasil dihasilkan. Ukuran: ${idpPDFBuffer.length} bytes.`);

        } catch (pdfBufferError) {
            // Jika pembuatan buffer PDF gagal, log error tapi jangan hentikan proses.
            // Kita tetap bisa menyimpan IDP JSON dan HTML.
            logger.error(`[API Generate IDP] Gagal menghasilkan buffer PDF (akan disimpan sebagai JSON & HTML saja): ${pdfBufferError.message}`, pdfBufferError);
            idpPDFBufferError = pdfBufferError.message; // Simpan pesan error untuk disimpan ke DB
            // idpPDFBuffer tetap null
        }
    } else {
        logger.warn(`[API Generate IDP] HTML IDP tidak tersedia, melewati pembuatan buffer PDF.`);
        idpPDFBufferError = 'HTML IDP tidak tersedia untuk pembuatan PDF.';
    }

    // --- 12. Simpan Draft IDP Lengkap (JSON, HTML, PDF Buffer) ke Database ---
    let savedIDPRecord;
    try {
        logger.info(`[API Generate IDP] Menyimpan IDP lengkap (JSON, HTML, PDF Buffer) ke database...`);

        // Siapkan data untuk disimpan ke tabel `idp_records`
        const idpRecordData = {
            processed_profile_id: processedProfileResult.data.id, // Relasi ke tabel processed_profiles
            status: idpPDFBuffer ? 'completed' : 'generated_with_errors', // Status akhir
            pdf_url: null, // Akan diisi saat PDF diunggah ke storage
            html_content: idpHTML, // Gunakan HTML yang dihasilkan, bisa null jika formatting gagal
            data_json: idpDraft, // Gunakan draft JSON yang dihasilkan
            error_message: idpPDFBufferError || (idpHTML ? null : 'Gagal membuat file HTML.') // Pesan error jika formatting/PDF gagal
        };

        // --- Simpan record IDP ke database ---
        const saveResult = await saveIDPRecord(idpRecordData);

        if (!saveResult.success) {
            throw saveResult.error || new Error(saveResult.message);
        }

        savedIDPRecord = saveResult.data; // Objek record IDP yang disimpan, termasuk `id`
        logger.info(`[API Generate IDP] IDP lengkap berhasil disimpan dengan ID record: ${savedIDPRecord.id}`);

        // --- (Opsional) Simpan buffer PDF ke storage (misalnya, Google Drive atau Supabase Storage) ---
        // Ini akan dilakukan di langkah berikutnya setelah record IDP dibuat.
        // Untuk sekarang, kita hanya hasilkan buffer-nya.

    } catch (saveError) {
        logger.error(`[API Generate IDP] Gagal menyimpan IDP lengkap ke database: ${saveError.message}`, saveError);
        return json(
            { success: false, message: `Failed to save complete IDP record: ${saveError.message}` },
            { status: 500 }
        );
    }

// --- GANTI KODE DARI BARIS 262 SAMPAI AKHIR FUNGSI ---

    // --- 13. Kembalikan Respons Sukses dengan ID Record ---
    logger.info(`[API Generate IDP] Seluruh proses untuk ${processedProfileData.nama_lengkap} (${processedProfileData.nim}) berhasil.`);
    return json(
        {
            success: true,
            message: 'IDP generated, formatted to HTML, and PDF buffer created successfully.',
            // DIPERBAIKI: Objek yang berisi detail IDP harus memiliki key, yaitu 'data'.
            data: {
                idp_record_id: savedIDPRecord.id,
                profile_id: processedProfileResult.data.id,
                nim: processedProfileData.nim
            }
        },
        { status: 201 } // Created
    );
}

