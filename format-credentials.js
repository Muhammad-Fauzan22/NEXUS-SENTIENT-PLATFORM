import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Skrip ini akan membaca file credentials.json Anda dan mengubahnya menjadi format .env yang aman.
console.log("--- Memulai Protokol Perekaya Kredensial ---");

try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const credentialPath = path.join(__dirname, 'nexus-ppsdm-system-2ab22aac4488.json');
  
  console.log(`Membaca file kredensial dari: ${credentialPath}`);
  
  const credentialFileContent = fs.readFileSync(credentialPath, 'utf8');
  const credentialObject = JSON.parse(credentialFileContent);
  
  // Mengubah objek kembali menjadi string JSON satu baris yang ringkas
  const singleLineJsonString = JSON.stringify(credentialObject);

  console.log("\n========================= KREDENSIAL SEMPURNA =========================");
  console.log("Salin seluruh baris di bawah ini (dimulai dari GOOGLE_...) dan tempelkan ke file .env Anda, menimpa baris yang lama.");
  console.log("\n");
  console.log(`GOOGLE_CREDENTIALS_JSON=${singleLineJsonString}`);
  console.log("\n");
  console.log("=======================================================================");

} catch (error) {
  console.error("\n❌ GAGAL: Tidak dapat memproses file kredensial.", error.message);
  console.error("Pastikan file 'nexus-ppsdm-system-2ab22aac4488.json' berada di direktori root proyek Anda.");
}