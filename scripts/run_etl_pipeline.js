import 'dotenv/config';
import { extractFromGoogleDrive } from './etl/1-extract-from-gdrive.js';
import { transformAndVectorize } from './etl/2-transform-with-ai.js';
import { loadToSupabase } from './etl/3-load-to-supabase.js';

async function runFullETLPipeline() {
  console.log("Memulai eksekusi pipeline ETL lengkap (E -> T -> L)...");
  try {
    // Langkah E: Ekstraksi
    const extractedData = await extractFromGoogleDrive();
    console.log(`\n✅ Ekstraksi selesai. Ditemukan ${extractedData.length} dokumen.`);

    // Langkah T: Transformasi
    const transformedData = await transformAndVectorize(extractedData);
    console.log(`\n✅ Transformasi selesai! Dihasilkan ${transformedData.length} knowledge chunks.`);

    // Langkah L: Pemuatan
    await loadToSupabase(transformedData);
    console.log(`\n✅ Pemuatan selesai! Basis pengetahuan AI telah diperbarui.`);

    console.log("\n==========================================================");
    console.log("🚀 PIPELINE ETL SELESAI DENGAN SUKSES! 🚀");
    console.log("==========================================================");

  } catch (error) {
    console.error("\n❌ PIPELINE ETL GAGAL:", error.message);
    process.exit(1);
  }
}

runFullETLPipeline();

