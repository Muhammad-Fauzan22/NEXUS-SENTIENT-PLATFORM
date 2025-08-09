// src/scripts/etl/1-extract-text.js
// Script untuk mengekstrak teks dari berbagai jenis dokumen sumber.

const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

// --- Konfigurasi ---
const KNOWLEDGE_BASE_DIR = path.join(__dirname, '../../src/lib/data/raw'); // Path ke folder dokumen sumber
const OUTPUT_DIR = path.join(__dirname, '../../src/lib/data/processed'); // Path untuk menyimpan teks mentah

/**
 * Mengekstrak teks dari file berdasarkan ekstensinya.
 * @param {string} filePath - Path lengkap ke file.
 * @returns {Promise<string>} - Teks yang diekstrak.
 */
async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let text = '';

    console.log(`[ETL Step 1.1] Mengekstrak teks dari: ${path.basename(filePath)} (${ext})`);

    try {
        if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else if (ext === '.pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const pdfData = await pdfParse(dataBuffer);
            text = pdfData.text;
        } else if (ext === '.txt') {
            // Untuk file teks biasa, baca langsung
            text = await fs.readFile(filePath, 'utf-8');
        } else {
            console.warn(`[ETL Step 1.1] Format file tidak didukung untuk ekstraksi teks: ${ext}. Melewati file.`);
            text = ''; // Atau bisa dilempar error jika diinginkan
        }
    } catch (error) {
        console.error(`[ETL Step 1.1] Gagal mengekstrak teks dari ${filePath}:`, error.message);
        throw error; // Lempar error agar proses berhenti atau bisa ditangani oleh caller
    }

    return text.trim(); // Hilangkan spasi di awal/akhir
}

/**
 * Fungsi utama untuk menjalankan proses ekstraksi.
 */
async function runExtraction() {
    console.log('[ETL Step 1.1] Memulai proses ekstraksi teks...');

    try {
        // Pastikan folder output ada
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        // Baca daftar file di folder knowledge_base
        const files = await fs.readdir(KNOWLEDGE_BASE_DIR);

        if (files.length === 0) {
            console.warn('[ETL Step 1.1] Tidak ada file ditemukan di folder knowledge_base.');
            return;
        }

        console.log(`[ETL Step 1.1] Ditemukan ${files.length} file untuk diproses.`);

        // Array untuk menyimpan hasil ekstraksi
        const extractedData = [];

        // Proses setiap file
        for (const file of files) {
            const filePath = path.join(KNOWLEDGE_BASE_DIR, file);
            const stats = await fs.stat(filePath);

            // Hanya proses file, bukan direktori
            if (stats.isFile()) {
                try {
                    const content = await extractTextFromFile(filePath);
                    extractedData.push({
                        fileName: file,
                        content: content,
                        sourcePath: filePath
                    });
                    console.log(`[ETL Step 1.1] Teks berhasil diekstrak dari: ${file}`);
                } catch (fileError) {
                    // Log error tapi jangan hentikan seluruh proses
                    console.error(`[ETL Step 1.1] Melewati file ${file} karena error:`, fileError.message);
                }
            }
        }

        // Simpan hasil ekstraksi ke file JSON
        const outputFilePath = path.join(OUTPUT_DIR, 'raw_knowledge_text.json');
        await fs.writeFile(outputFilePath, JSON.stringify(extractedData, null, 2));

        console.log(`[ETL Step 1.1] Ekstraksi selesai. Data disimpan di: ${outputFilePath}`);
        console.log(`[ETL Step 1.1] Jumlah file yang berhasil diekstrak: ${extractedData.length}/${files.length}`);

    } catch (error) {
        console.error('[ETL Step 1.1] Terjadi kesalahan fatal dalam proses ekstraksi:', error);
        process.exit(1); // Hentikan proses jika ada error kritis
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    runExtraction().catch(console.error);
}

// --- Eksport fungsi untuk digunakan oleh script lain ---
module.exports = { runExtraction, extractTextFromFile };


// SARAN: LANJUTKAN KE FILE src/scripts/etl/2-chunk-text.js