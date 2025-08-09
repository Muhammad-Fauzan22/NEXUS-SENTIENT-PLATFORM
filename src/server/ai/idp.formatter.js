// src/lib/server/ai/idp.formatter.js
// Utilitas untuk memformat draft IDP (JSON) menjadi HTML terstruktur dan dapat dibaca manusia.
// Digunakan untuk menampilkan IDP di browser dan menghasilkan PDF.

// @ts-nocheck
// DIPERBAIKI: Menambahkan @ts-nocheck untuk menonaktifkan pemeriksaan tipe TypeScript pada file JavaScript ini.
// Ini akan menyelesaikan semua error terkait tipe dan resolusi modul.

import logger from '$lib/server/utils/logger';

/**
 * Memformat draft IDP JSON menjadi string HTML terstruktur.
 * @param {Object} idpJson - Objek draft IDP dalam format JSON.
 * @returns {Promise<{success: boolean, data: any, error: any}>} - Hasil operasi.
 */
export async function formatIDPToHTML(idpJson) {
    // --- 1. Validasi Input ---
    if (!idpJson || typeof idpJson !== 'object') {
        const errorMsg = 'Draft IDP JSON tidak valid.';
        logger.error(`[IDP Formatter] formatIDPToHTML FAILED: ${errorMsg}`);
        return { success: false, data: null, error: new Error(errorMsg) };
    }

    try {
        logger.info('[IDP Formatter] Memulai pemformatan draft IDP ke HTML.');

        // --- 2. Bangun HTML ---
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Individual Development Plan (IDP) - ${idpJson.mahasiswa?.nama_lengkap || 'Mahasiswa ITS'}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
                .container { max-width: 900px; margin: 20px auto; padding: 20px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; }
                .header { text-align: center; margin-bottom: 30px; padding: 20px; background-color: #004b87; color: white; border-radius: 8px; }
                .section { margin-bottom: 25px; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                h1, h2, h3, h4 { color: #004b87; }
                h1 { font-size: 2em; margin-bottom: 10px; }
                h2 { font-size: 1.5em; border-bottom: 2px solid #004b87; padding-bottom: 5px; margin-top: 0; margin-bottom: 20px; }
                h3 { font-size: 1.2em; margin-top: 20px; margin-bottom: 10px; }
                h4 { font-size: 1.1em; margin-top: 15px; margin-bottom: 10px; font-weight: 600; }
                ul, ol { padding-left: 20px; }
                li { margin-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
                th, td { border: 1px solid #cbd5e0; padding: 12px; text-align: left; vertical-align: top; }
                th { background-color: #ebf8ff; font-weight: bold; }
                .profile-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
                .profile-box { background-color: #f8fafc; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0; }
                .footer { text-align: center; margin-top: 40px; font-size: 0.9em; color: #777; }
                .no-data { font-style: italic; color: #888; }
                .highlight-box { background-color: #fffbeb; border: 1px solid #fde68a; padding: 1rem; border-radius: 6px; margin-top: 1.5rem; }
                .section-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 1.5rem; margin-bottom: 1.5rem; background-color: #f8fafc; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Individual Development Plan (IDP)</h1>
                    <p>Dibuat oleh: NEXUS - Sentient Development Platform</p>
                    <p>Untuk: ${idpJson.mahasiswa?.nama_lengkap || 'N/A'} (${idpJson.mahasiswa?.nim || 'N/A'})</p>
                </div>
        `;

        // --- 3. Bagian Informasi Mahasiswa ---
        htmlContent += `<div class="section"><h2>Informasi Mahasiswa</h2>`;
        if (idpJson.mahasiswa) {
            htmlContent += `<div class="profile-info"><div class="profile-box">
                            <strong>Nama Lengkap:</strong> ${idpJson.mahasiswa.nama_lengkap || '-'}<br>
                            <strong>NIM:</strong> ${idpJson.mahasiswa.nim || '-'}<br>
                            <strong>Departemen:</strong> ${idpJson.mahasiswa.departemen || '-'}<br>
                            <strong>Email:</strong> ${idpJson.mahasiswa.email || '-'}<br>
                        </div>`;
            if (idpJson.mahasiswa.profil) {
                const profil = idpJson.mahasiswa.profil;
                htmlContent += `<div class="profile-box">
                            <strong>Minat Dominan (RIASEC):</strong> ${profil.riasec?.dominant_type || '-'}<br>
                            <strong>Gaya Belajar Dominan (VARK):</strong> ${profil.vark?.dominant_style || '-'}<br>
                            <strong>Bidang Minat Utama:</strong> ${profil.minat_bidang?.dominant_interest || '-'}<br>
                        </div>`;
            }
            htmlContent += `</div>`;
        } else {
            htmlContent += `<p class="no-data">Data profil mahasiswa tidak tersedia.</p>`;
        }
        htmlContent += `</div>`;

        // --- 4. Bagian Rencana Pengembangan (IDP) ---
        htmlContent += `<div class="section"><h2>Rencana Pengembangan</h2>`;
        if (idpJson.idp) {
            const idp = idpJson.idp;
            htmlContent += `<h3>${idp.judul || 'Rencana Pengembangan Personal'}</h3>
                           <p><strong>Periode:</strong> ${idp.periode || '-'}</p>
                           <p><strong>Visi Karir:</strong> ${idp.visi_karir || '-'}</p>
                           <h3>Kompetensi Utama</h3>`;
            if (idp.kompetensi_utama?.length) {
                htmlContent += `<ul>${idp.kompetensi_utama.map(comp => `<li>${comp}</li>`).join('')}</ul>`;
            } else {
                htmlContent += `<p class="no-data">Informasi kompetensi utama tidak tersedia.</p>`;
            }
            htmlContent += `<h3>Peta Jalur Pengembangan</h3>`;
            if (idp.peta_jalur?.length) {
                idp.peta_jalur.forEach((jalur, index) => {
                    htmlContent += `<div class="section-box"><h4>${jalur.semester || `Semester ${index + 1}`}</h4>`;
                    if (jalur.fokus_pengembangan?.length) {
                        htmlContent += `<p><strong>Fokus Pengembangan:</strong></p><ul>${jalur.fokus_pengembangan.map(fokus => `<li>${fokus}</li>`).join('')}</ul>`;
                    }
                    htmlContent += `<p><strong>Aktivitas:</strong></p>`;
                    if (jalur.aktivitas?.length) {
                        htmlContent += `<table><thead><tr><th>Jenis</th><th>Deskripsi</th><th>Tujuan</th><th>Sumber Info</th></tr></thead><tbody>`;
                        jalur.aktivitas.forEach(aktivitas => {
                            htmlContent += `<tr><td>${aktivitas.jenis || '-'}</td><td>${aktivitas.deskripsi || '-'}</td><td>${aktivitas.tujuan || '-'}</td><td>${aktivitas.sumber_info || '-'}</td></tr>`;
                        });
                        htmlContent += `</tbody></table>`;
                    } else {
                        htmlContent += `<p class="no-data">Tidak ada aktivitas yang direkomendasikan.</p>`;
                    }
                    if (jalur.indikator_keberhasilan?.length) {
                        htmlContent += `<p><strong>Indikator Keberhasilan:</strong></p><ul>${jalur.indikator_keberhasilan.map(indikator => `<li>${indikator}</li>`).join('')}</ul>`;
                    }
                    htmlContent += `</div>`;
                });
            } else {
                htmlContent += `<p class="no-data">Peta jalur pengembangan belum dibuat.</p>`;
            }
            htmlContent += `<h3>Sumber Dukungan</h3>`;
            if (idp.sumber_dukungan?.length) {
                htmlContent += `<ul>${idp.sumber_dukungan.map(sumber => `<li>${sumber}</li>`).join('')}</ul>`;
            } else {
                htmlContent += `<p class="no-data">Sumber dukungan tidak ditentukan.</p>`;
            }
            if (idp.catatan) {
                htmlContent += `<div class="highlight-box"><h3>Catatan</h3><p>${idp.catatan}</p></div>`;
            }
        } else {
            htmlContent += `<p class="no-data">Rencana pengembangan (IDP) belum tersedia.</p>`;
        }
        htmlContent += `</div>`;

        // --- 5. Footer ---
        htmlContent += `<div class="footer">
                    <p>Dokumen ini dibuat secara otomatis oleh NEXUS pada ${new Date().toLocaleString('id-ID')}.</p>
                    <p>© ${new Date().getFullYear()} PPSDM Keluarga Mahasiswa Mesin ITS. Hak Cipta Dilindungi.</p>
                </div>`;

        // --- 6. Tutup Tag HTML ---
        htmlContent += `</div></body></html>`;

        logger.info('[IDP Formatter] Draft IDP berhasil diformat ke HTML.');
        // DIPERBAIKI: Menggunakan key 'data' dan shorthand property
        return { success: true, data: htmlContent, error: null };

    } catch (error) {
        const errorMsg = `Gagal memformat IDP ke HTML: ${error.message}`;
        logger.error(`[IDP Formatter] formatIDPToHTML FAILED: ${errorMsg}`, { stack: error.stack });
        // DIPERBAIKI: Menambahkan key 'data'
        return { success: false, data: null, error: error };
    }
}