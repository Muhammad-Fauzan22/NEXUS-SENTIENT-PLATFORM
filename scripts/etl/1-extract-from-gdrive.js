// File: scripts/etl/1-extract-from-gdrive.js
import { google } from 'googleapis';
import { getGoogleAuth } from '../utils/auth.js';
import 'dotenv/config';

export async function extractFromGoogleDrive() {
  console.log('--- Memulai Ekstraksi dari Google Drive ---');
  const folderId = process.env.GDRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error('Variabel lingkungan GDRIVE_FOLDER_ID tidak ditemukan. Pastikan file .env sudah dikonfigurasi dengan benar.');
  }

  try {
    const auth = await getGoogleAuth();
    console.log('✅ Otentikasi Google Drive berhasil.');

    const drive = google.drive({ version: 'v3', auth });
    const listResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    const files = listResponse.data.files;
    if (!files || files.length === 0) {
      console.warn(`⚠️  Tidak ada file ditemukan di folder dengan ID: ${folderId}`);
      return [];
    }

    console.log(`   Ditemukan ${files.length} file untuk diekstrak.`);
    const extractedData = [];

    for (const file of files) {
      try {
        console.log(`    Memproses file: ${file.name} (ID: ${file.id})`);
        const getContentResponse = await drive.files.get({
          fileId: file.id,
          alt: 'media',
        });

        const contentText = getContentResponse.data;
        extractedData.push({
          source_document: file.name,
          content_text: contentText,
        });
        console.log(`    ✅ Ekstraksi berhasil untuk: ${file.name}`);
      } catch (fileError) {
        console.error(`    ❌ Gagal mengunduh konten untuk file ${file.name} (ID: ${file.id}):`, fileError.message);
      }
    }

    console.log('--- Ekstraksi dari Google Drive selesai ---');
    return extractedData;
  } catch (error) {
    console.error('❌ Terjadi kesalahan fatal dalam extractFromGoogleDrive:', error.message);
    throw error;
  }
}