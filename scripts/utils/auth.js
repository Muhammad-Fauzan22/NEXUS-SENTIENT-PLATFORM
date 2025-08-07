// scripts/utils/auth.js
import { google } from 'googleapis';
import 'dotenv/config'; // Memuat variabel lingkungan dari .env

/**
 * Membuat dan mengembalikan instance otentikasi Google JWT.
 * Instance ini digunakan untuk mengakses API Google Drive dengan izin yang ditentukan.
 *
 * @returns {Promise<google.auth.JWT>} Sebuah Promise yang resolve ke instance google.auth.JWT yang telah diautentikasi.
 * @throws {Error} Jika variabel lingkungan GOOGLE_CREDENTIALS_JSON tidak ditemukan atau tidak valid.
 */
export async function getGoogleAuth() {
  // Langkah 1: Baca variabel lingkungan.
  const credentialsJsonString = process.env.GOOGLE_CREDENTIALS_JSON;

  // Langkah 2: Validasi keberadaan variabel. Ini adalah pemeriksaan pertama.
  if (!credentialsJsonString) {
    throw new Error('Variabel lingkungan GOOGLE_CREDENTIALS_JSON tidak ditemukan. Pastikan file .env sudah dikonfigurasi dengan benar dan berisi konten JSON yang valid.');
  }

  let credentials;
  try {
    // Langkah 3: Coba parsing string JSON menjadi objek.
    credentials = JSON.parse(credentialsJsonString);
  } catch (parseError) {
    // Jika parsing gagal, berarti konten di .env bukan JSON yang valid.
    console.error("Konten dari GOOGLE_CREDENTIALS_JSON:", credentialsJsonString); // Log konten untuk debugging
    throw new Error(`Gagal mem-parsing GOOGLE_CREDENTIALS_JSON. Pastikan seluruh konten file credentials.json telah disalin dengan benar. Detail error: ${parseError.message}`);
  }

  // Langkah 4: Validasi properti penting di dalam objek kredensial.
  if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Objek GOOGLE_CREDENTIALS_JSON tidak valid. Properti "client_email" atau "private_key" tidak ditemukan.');
  }

  // Langkah 5: Buat dan kembalikan instance otentikasi.
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return auth;
}
