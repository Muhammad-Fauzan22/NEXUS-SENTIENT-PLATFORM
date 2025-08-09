// scripts/format-credentials.js
// Skrip utilitas mandiri untuk memformat dan memvalidasi kredensial Google Drive Service Account.
// Mengonversi file JSON kredensial menjadi string satu baris yang siap untuk BASE64 encoding.
// Digunakan untuk mempersiapkan GOOGLE_CREDENTIALS_JSON_BASE64 untuk environment variables (.env, Netlify, Vercel).

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../src/lib/server/utils/logger.js'; // <<<<<<<<< SESUAIKAN PATH JIKA DIPERLUKAN

// --- Dapatkan __dirname di ES Module ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Konfigurasi ---
// Path relatif ke file kredensial dari lokasi skrip ini
const CREDENTIALS_FILE_RELATIVE_PATH = '../src/lib/server/config/credentials.json'; // <<<<<<<<< SESUAIKAN DENGAN LOKASI FILE ANDA
const OUTPUT_FILE_NAME = 'formatted-google-credentials.txt'; // Nama file output

/**
 * Fungsi utama untuk memformat kredensial.
 */
async function formatCredentials() {
    logger.info('[Format Credentials Script] Memulai proses memformat kredensial Google Drive...');

    try {
        // --- 1. Bangun path absolut ke file kredensial ---
        const credentialsFilePath = path.resolve(__dirname, CREDENTIALS_FILE_RELATIVE_PATH);
        logger.debug(`[Format Credentials Script] Path file kredensial: ${credentialsFilePath}`);

        // --- 2. Baca file kredensial ---
        logger.info(`[Format Credentials Script] Membaca file kredensial dari: ${credentialsFilePath}`);
        const credentialsBuffer = await fs.readFile(credentialsFilePath);
        const credentialsString = credentialsBuffer.toString('utf-8');
        logger.debug(`[Format Credentials Script] File kredensial berhasil dibaca (${credentialsBuffer.length} bytes).`);

        // --- 3. Validasi format JSON ---
        let credentialsJson;
        try {
            credentialsJson = JSON.parse(credentialsString);
            logger.info('[Format Credentials Script] File kredensial adalah JSON yang valid.');
        } catch (parseError) {
            throw new Error(`File kredensial bukan JSON yang valid: ${parseError.message}`);
        }

        // --- 4. Validasi field kunci ---
        const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id', 'auth_uri', 'token_uri', 'auth_provider_x509_cert_url', 'client_x509_cert_url'];
        const missingFields = requiredFields.filter(field => !(field in credentialsJson));

        if (missingFields.length > 0) {
            throw new Error(`Field kredensial yang diperlukan tidak ditemukan: ${missingFields.join(', ')}`);
        }
        logger.info('[Format Credentials Script] Semua field kredensial yang diperlukan ditemukan.');

        // --- 5. Format ke string JSON satu baris ---
        // Ini penting untuk BASE64 encoding dan penyimpanan di environment variables
        const formattedCredentialsString = JSON.stringify(credentialsJson);
        logger.debug(`[Format Credentials Script] Kredensial diformat ke string JSON satu baris.`);

        // --- 6. Simpan ke file output ---
        const outputFilePath = path.join(__dirname, OUTPUT_FILE_NAME);
        logger.info(`[Format Credentials Script] Menyimpan kredensial yang diformat ke: ${outputFilePath}`);
        await fs.writeFile(outputFilePath, formattedCredentialsString, 'utf-8');
        logger.info('[Format Credentials Script] Kredensial yang diformat berhasil disimpan.');

        // --- 7. Tampilkan instruksi BASE64 encoding ---
        console.log('\n--- HASIL PEMFORMATAN KREDENSIAL ---');
        console.log('✅ File kredensial berhasil diformat dan disimpan ke:');
        console.log(`   ${outputFilePath}`);
        console.log('');
        console.log('📋 Untuk menggunakannya sebagai environment variable (misalnya, GOOGLE_CREDENTIALS_JSON_BASE64):');
        console.log('   1. Buka terminal/command prompt.');
        console.log('   2. Jalankan perintah berikut untuk meng-encode file ke BASE64:');
        console.log(`      # Di Linux/macOS:`);
        console.log(`      base64 -i ${OUTPUT_FILE_NAME} -o encoded-google-credentials.txt`);
        console.log(`      # Di Windows (PowerShell):`);
        console.log(`      [Convert]::ToBase64String([IO.File]::ReadAllBytes("${OUTPUT_FILE_NAME}")) > encoded-google-credentials.txt`);
        console.log(`      # Di Windows (Command Prompt):`);
        console.log(`      certutil -encode ${OUTPUT_FILE_NAME} encoded-google-credentials.txt && findstr /v /c:- encoded-google-credentials.txt > temp.txt && move /y temp.txt encoded-google-credentials.txt`);
        console.log('');
        console.log('   3. Buka file `encoded-google-credentials.txt` yang dihasilkan.');
        console.log('   4. Salin seluruh isi file tersebut (itu adalah string BASE64 panjang).');
        console.log('   5. Tempelkan ke file `.env` Anda sebagai nilai untuk variabel:');
        console.log(`      GOOGLE_CREDENTIALS_JSON_BASE64=...isi_string_panjang_disini...`);
        console.log('   6. Simpan file `.env` Anda.');
        console.log('');
        console.log('🔐 Pastikan file `.env` TIDAK di-commit ke repositori publik!');
        console.log('--- AKHIR HASIL PEMFORMATAN ---\n');

    } catch (error) {
        logger.error(`[Format Credentials Script] Gagal memformat kredensial: ${error.message}`, error);
        console.error('\n❌ Gagal memformat kredensial:', error.message);
        process.exit(1); // Keluar dengan kode error
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    formatCredentials().catch(console.error);
}

export { formatCredentials };