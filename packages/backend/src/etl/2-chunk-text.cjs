// packages/backend/src/etl/2-chunk-text.cjs
// Script untuk memproses data yang diekstrak (khususnya dari XLSX) menjadi "chunk" per baris.

const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger.cjs');

// --- Konfigurasi ---
const EXTRACTED_DATA_DIR = path.join(process.cwd(), 'data', 'extracted');
const CHUNKED_DATA_DIR = path.join(process.cwd(), 'data', 'chunked');

/**
 * Fungsi utama untuk menjalankan proses chunking per baris.
 */
async function runChunking() {
    logger.info('[ETL Step 2 - Chunk] Memulai proses chunking per baris...');
    try {
        await fs.mkdir(CHUNKED_DATA_DIR, { recursive: true });
        const files = await fs.readdir(EXTRACTED_DATA_DIR);
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        let totalChunksCreated = 0;

        for (const file of jsonFiles) {
            const filePath = path.join(EXTRACTED_DATA_DIR, file);
            logger.info(`[ETL Step 2 - Chunk] Memproses file: ${file}`);
            try {
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const { source_document, extracted_data } = JSON.parse(fileContent);

                // Cek apakah data adalah array (dari XLSX)
                if (!Array.isArray(extracted_data)) {
                    logger.warn(`[ETL Step 2 - Chunk] Data di file ${file} bukan array. Melewati.`);
                    continue;
                }

                // Anggap baris pertama adalah header
                const headers = extracted_data[0];
                const rows = extracted_data.slice(1);

                const chunkedItems = rows.map((row, rowIndex) => {
                    // Gabungkan semua sel dalam satu baris menjadi satu string teks
                    const contentText = row.map((cell, index) => `${headers[index]}: ${cell}`).join(', ');

                    return {
                        id: uuidv4(),
                        source_document: source_document,
                        content_text: contentText,
                        chunk_metadata: {
                            row_number: rowIndex + 2, // +1 untuk slice, +1 untuk header
                            char_length: contentText.length,
                        },
                    };
                });
                
                const outputFileName = `${path.basename(file, '.json')}_chunks.json`;
                const outputPath = path.join(CHUNKED_DATA_DIR, outputFileName);
                await fs.writeFile(outputPath, JSON.stringify(chunkedItems, null, 2));
                
                logger.info(`[ETL Step 2 - Chunk] ✅ File ${file} diproses menjadi ${chunkedItems.length} chunk (baris).`);
                totalChunksCreated += chunkedItems.length;

            } catch (error) {
                logger.error(`[ETL Step 2 - Chunk] Gagal memproses file ${file}:`, error);
            }
        }
        logger.info(`[ETL Step 2 - Chunk] Proses chunking selesai. Total chunk yang dibuat: ${totalChunksCreated}`);
    } catch (error) {
        logger.error('[ETL Step 2 - Chunk] Terjadi kesalahan fatal:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runChunking();
}

module.exports = { runChunking };