import { logger } from '$lib/server/utils/logger';
import type { GeneratedIDP } from '$lib/types/schemas';

/**
 * Memformat objek IDP JSON menjadi string HTML yang terstruktur dan siap dirender.
 *
 * @param idpJson - Objek IDP yang dihasilkan oleh AI.
 * @returns String HTML yang telah diformat.
 * @throws {Error} Jika input JSON tidak valid.
 */
export function formatIdp(idpJson: GeneratedIDP): string {
	if (!idpJson || typeof idpJson !== 'object') {
		const errorMsg = 'Input IDP JSON tidak valid.';
		logger.error(`[IDP Formatter] FAILED: ${errorMsg}`);
		throw new Error(errorMsg);
	}

	logger.info('Memulai pemformatan IDP JSON ke HTML...');

	const { linkedin_summary, potential_analysis, career_goals_analysis, roadmap } = idpJson;

	let roadmapHtml = '';
	if (roadmap && roadmap.length > 0) {
		roadmap.forEach((semester) => {
			roadmapHtml += `
        <div class="semester-block">
          <h3>Semester ${semester.semester}: ${semester.theme}</h3>
          <div class="development-area">
            <h4>Akademik</h4>
            <p><strong>Fokus:</strong> ${semester.academic.focus}</p>
            <p><strong>Mata Kuliah Relevan:</strong> ${semester.academic.courses?.join(', ') ?? 'N/A'}</p>
            <p><strong>KPIs:</strong></p>
            <ul>${semester.academic.kpis.map((kpi: string) => `<li>${kpi}</li>`).join('')}</ul>
          </div>
          <div class="development-area">
            <h4>Non-Akademik</h4>
            <p><strong>Fokus:</strong> ${semester.non_academic.focus}</p>
            <p><strong>Program Pengembangan:</strong> ${semester.non_academic.development_programs?.join(', ') ?? 'N/A'}</p>
            <p><strong>KPIs:</strong></p>
            <ul>${semester.non_academic.kpis.map((kpi: string) => `<li>${kpi}</li>`).join('')}</ul>
          </div>
        </div>
      `;
		});
	} else {
		roadmapHtml = '<p>Roadmap pengembangan belum tersedia.</p>';
	}

	const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Individual Development Plan</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: auto; padding: 20px; }
        h1, h2, h3, h4 { color: #004b87; }
        h1 { text-align: center; border-bottom: 2px solid #004b87; padding-bottom: 10px; }
        .section { margin-bottom: 2rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
        .semester-block { margin-bottom: 1.5rem; padding-left: 1rem; border-left: 3px solid #4299e1; }
        .development-area { margin-top: 1rem; }
        ul { padding-left: 20px; }
        li { margin-bottom: 0.5rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Individual Development Plan</h1>
        
        <div class="section">
          <h2>Ringkasan Profesional (LinkedIn)</h2>
          <p>${linkedin_summary || 'Ringkasan belum tersedia.'}</p>
        </div>

        <div class="section">
          <h2>Analisis Potensi Diri</h2>
          <p>${potential_analysis || 'Analisis potensi belum tersedia.'}</p>
        </div>

        <div class="section">
          <h2>Analisis Tujuan Karir</h2>
          <p>${career_goals_analysis || 'Analisis tujuan karir belum tersedia.'}</p>
        </div>

        <div class="section">
          <h2>Roadmap Pengembangan 8 Semester</h2>
          ${roadmapHtml}
        </div>

      </div>
    </body>
    </html>
  `;

	logger.info('Pemformatan IDP ke HTML selesai.');
	return fullHtml;
}