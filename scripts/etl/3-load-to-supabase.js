// File: scripts/etl/3-load-to-supabase.js
import 'dotenv/config';
import { supabaseAdmin } from '../../src/lib/server/db/supabase.admin.ts';

export async function loadToSupabase(transformedChunks) {
  console.log('--- Memulai Pemuatan ke Supabase ---');
  try {
    // 5a. Pembersihan Data Lama
    console.log('    Membersihkan data lama dari tabel knowledge_chunks...');
    const { error: deleteError } = await supabaseAdmin
      .from('knowledge_chunks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Perbaikan: Menambahkan kondisi WHERE

    if (deleteError) {
      throw new Error(`Gagal membersihkan data lama: ${deleteError.message}`);
    }
    console.log('    ✅ Pembersihan data lama berhasil.');

    // 5b. Pemuatan Data Baru
    if (!transformedChunks || transformedChunks.length === 0) {
      console.warn('    ⚠️  Tidak ada data baru untuk dimuat.');
      console.log('--- Pemuatan ke Supabase selesai (tidak ada data baru). ---');
      return;
    }

    console.log(`    Memuat ${transformedChunks.length} chunk baru ke Supabase...`);
    const { data, error: insertError } = await supabaseAdmin
      .from('knowledge_chunks')
      .insert(transformedChunks);

    if (insertError) {
      throw new Error(`Gagal memuat data baru: ${insertError.message}`);
    }

    console.log(`    ✅ ${transformedChunks.length} chunk berhasil dimuat.`);
    console.log('--- Pemuatan ke Supabase selesai. ---');
  } catch (error) {
    console.error('❌ Terjadi kesalahan dalam loadToSupabase:', error.message);
    throw error;
  }
}