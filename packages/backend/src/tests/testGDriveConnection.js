// scripts/tests/testGDriveConnection.js
// Skrip mandiri untuk menguji koneksi ke Google Drive API menggunakan gdrive.config.js.

import logger from '$lib/server/utils/logger';
import { auth, GDRIVE_FOLDER_ID } from '$lib/server/config/gdrive.config';
import { google } from 'googleapis';

/**
 * Fungsi utama untuk menguji koneksi ke Google Drive.
 */
async function testGDriveConnection() {
    logger.info('[Test GDrive Conn] Memulai pengujian koneksi ke Google Drive...');

    try {
        // --- Dapatkan client auth ---
        logger.debug('[Test GDrive Conn] Mendapatkan client auth dari gdrive.config.js...');
        const authClient = await auth.getClient();
        logger.debug('[Test GDrive Conn] Client auth berhasil didapatkan.');

        // --- Inisialisasi Google Drive API ---
        logger.debug('[Test GDrive Conn] Menginisialisasi Google Drive API...');
        const drive = google.drive({ version: 'v3', auth: authClient });
        logger.debug('[Test GDrive Conn] Google Drive API berhasil diinisialisasi.');

        // --- Uji: Dapatkan informasi akun service ---
        logger.debug('[Test GDrive Conn] Menguji akses ke informasi akun service...');
        const aboutRes = await drive.about.get({ fields: 'user' });
        const userEmail = aboutRes.data.user?.emailAddress;
        logger.info(`[Test GDrive Conn] Terhubung sebagai user: ${userEmail}`);
        console.log(`✅ Koneksi ke Google Drive BERHASIL! Terhubung sebagai: ${userEmail}`);

        // --- Uji: Dapatkan informasi folder target ---
        if (GDRIVE_FOLDER_ID) {
            logger.debug(`[Test GDrive Conn] Menguji akses ke folder dengan ID: ${GDRIVE_FOLDER_ID}...`);
            try {
                const folderRes = await drive.files.get({
                    fileId: GDRIVE_FOLDER_ID,
                    fields: 'id, name, mimeType'
                });
                const folderName = folderRes.data.name;
                const mimeType = folderRes.data.mimeType;
                logger.info(`[Test GDrive Conn] Akses ke folder berhasil: ${folderName} (${mimeType})`);
                console.log(`   - Folder Target: ${folderName} (${GDRIVE_FOLDER_ID})`);
            } catch (folderError) {
                if (folderError.code === 404) {
                    logger.error(`[Test GDrive Conn] Folder dengan ID ${GDRIVE_FOLDER_ID} tidak ditemukan.`);
                    console.error(`❌ Folder dengan ID ${GDRIVE_FOLDER_ID} tidak ditemukan.`);
                } else if (folderError.code === 403) {
                    logger.error(`[Test GDrive Conn] Tidak memiliki izin untuk mengakses folder dengan ID ${GDRIVE_FOLDER_ID}.`);
                    console.error(`❌ Tidak memiliki izin untuk mengakses folder dengan ID ${GDRIVE_FOLDER_ID}.`);
                } else {
                    throw folderError;
                }
            }
        } else {
            logger.warn('[Test GDrive Conn] GDRIVE_FOLDER_ID tidak ditemukan di .env.');
            console.warn('⚠️ GDRIVE_FOLDER_ID tidak ditemukan di .env.');
        }

        // --- Uji: Daftar beberapa file di root (opsional) ---
        logger.debug('[Test GDrive Conn] Mencoba mendaftar beberapa file di root drive...');
        const listRes = await drive.files.list({
            pageSize: 3,
            fields: 'files(id, name, mimeType)',
        });
        const files = listRes.data.files;
        if (files && files.length > 0) {
            logger.info(`[Test GDrive Conn] Ditemukan ${files.length} file(s) di root:`);
            console.log('   - File di Root:');
            files.forEach(file => {
                console.log(`     * ${file.name} (${file.id}) [${file.mimeType}]`);
            });
        } else {
            logger.info('[Test GDrive Conn] Tidak ada file ditemukan di root drive.');
            console.log('   - Tidak ada file di root drive.');
        }

    } catch (error) {
        logger.error('[Test GDrive Conn] Koneksi ke Google Drive GAGAL:', error);
        console.error('❌ Koneksi ke Google Drive GAGAL:', error.message);
        process.exit(1); // Keluar dengan kode error
    }
}

// --- Jalankan fungsi utama jika file ini dijalankan langsung ---
if (require.main === module) {
    testGDriveConnection().catch(console.error);
}

export { testGDriveConnection };