// packages/backend/src/etl/1-extract-text.cjs
// Script untuk mengekstrak teks mentah dari berbagai format file (PDF, DOCX, TXT).

const fs = require('fs/promises');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const logger = require('../utils/logger.cjs');

// --- Konfigurasi ---
const RAW_DATA_DIR = path.join(process.cwd(), 'data', 'raw');
const EXTRACTED_DATA_DIR = path.join(process.cwd(), 'data', 'extracted');

/**
 * Mengekstrak teks dari file PDF.
 * @param {string} filePath - Path ke file PDF.
 * @returns {Promise<string>} Teks yang diekstrak.
 */
async function extractTextFromPdf(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        logger.error(`Gagal mengekstrak teks dari PDF: ${filePath}`, error);
        return '';
    }
}

/**
 * Mengekstrak teks dari file DOCX.
 * @param {string} filePath - Path ke file DOCX.
 * @returns {Promise<string>} Teks yang diekstrak.
 */
async function extractTextFromDocx(filePath) {
    try {
        const { value } = await mammoth.extractRawText({ path: filePath });
        return value;
    } catch (error) {
        logger.error(`Gagal mengekstrak teks dari DOCX: ${filePath}`, error);
        return '';
    }
}

/**
 * Mengekstrak teks dari file XLSX.
 * @param {string} filePath - Path ke file XLSX.
 * @returns {Promise<string>} Teks yang diekstrak.
 */
async function extractTextFromXlsx(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Konversi sheet ke array of objects, setiap object adalah satu baris
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        return jsonData;
    } catch (error) {
        logger.error(`Gagal mengekstrak teks dari XLSX: ${filePath}`, error);
        return null;
    }
}

/**
 * Membaca teks dari file TXT.
 * @param {string} filePath - Path ke file TXT.
 * @returns {Promise<string>} Teks dari file.
 */
async function extractTextFromTxt(filePath) {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        logger.error(`Gagal membaca file teks: ${filePath}`, error);
        return '';
    }
}

/**
 * Fungsi utama untuk menjalankan proses ekstraksi.
 */
async function runExtraction() {
    logger.info('[ETL Step 1 - Extract] Memulai proses ekstraksi teks...');
    try {
        await fs.mkdir(EXTRACTED_DATA_DIR, { recursive: true });
        const files = await fs.readdir(RAW_DATA_DIR);
        let extractedCount = 0;

        for (const file of files) {
            const filePath = path.join(RAW_DATA_DIR, file);
            const fileExt = path.extname(file).toLowerCase();
            let textContent = '';

            logger.info(`[ETL Step 1 - Extract] Memproses file: ${file}`);

            if (fileExt === '.pdf') {
                textContent = await extractTextFromPdf(filePath);
            } else if (fileExt === '.docx') {
                textContent = await extractTextFromDocx(filePath);
            } else if (fileExt === '.xlsx') {
                textContent = await extractTextFromXlsx(filePath);
            } else if (fileExt === '.txt') {
                textContent = await extractTextFromTxt(filePath);
            } else {
                logger.warn(`[ETL Step 1 - Extract] Melewati file dengan format tidak didukung: ${file}`);
                continue;
            }

            if (textContent) {
                const outputFileName = `${path.basename(file, fileExt)}.json`;
                const outputPath = path.join(EXTRACTED_DATA_DIR, outputFileName);
                // Untuk XLSX, textContent adalah array (data), untuk lainnya adalah string
                const outputData = {
                    source_document: file,
                    // Simpan data mentah (array atau string)
                    extracted_data: textContent,
                    extraction_date: new Date().toISOString(),
                };
                await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
                logger.info(`[ETL Step 1 - Extract] ✅ Data berhasil diekstrak dan disimpan ke: ${outputFileName}`);
                extractedCount++;
            } else {
                logger.warn(`[ETL Step 1 - Extract] ⚠️ Tidak ada konten teks yang diekstrak dari: ${file}`);
            }
        }
        logger.info(`[ETL Step 1 - Extract] Proses ekstraksi selesai. Total file yang diproses: ${extractedCount}`);
    } catch (error) {
        logger.error('[ETL Step 1 - Extract] Terjadi kesalahan fatal:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runExtraction();
}

module.exports = { runExtraction };

