import fs from 'node:fs';
import path from 'node:path';
import { supabaseAdmin } from '../../src/lib/server/supabase';
import { logger } from '../../src/lib/server/utils/logger';

// This worker ingests ESCO skills & occupations CSV files (downloaded manually/API) into Supabase tables
// Expected files placed under ./datasets/skills/esco/: skills.csv, occupations.csv

async function main() {
	const base = path.resolve(process.cwd(), 'datasets', 'skills', 'esco');
	const skillsCsv = path.join(base, 'skills.csv');
	const occCsv = path.join(base, 'occupations.csv');
	if (!fs.existsSync(base)) {
		logger.warn('ESCO base folder not found. Skipping.');
		return;
	}

	if (fs.existsSync(skillsCsv)) {
		const lines = fs.readFileSync(skillsCsv, 'utf8').split(/\r?\n/).filter(Boolean);
		const rows = lines
			.slice(1)
			.map((l) => l.split(','))
			.filter((a) => a.length >= 2);
		for (const r of rows) {
			const [code, name] = r;
			const { error } = await supabaseAdmin
				.from('esco_skills')
				.upsert({ code, name }, { onConflict: 'code' });
			if (error) logger.error('ESCO skill upsert failed', { code, error });
		}
		logger.info('ESCO skills ingested', { count: rows.length });
	}

	if (fs.existsSync(occCsv)) {
		const lines = fs.readFileSync(occCsv, 'utf8').split(/\r?\n/).filter(Boolean);
		const rows = lines
			.slice(1)
			.map((l) => l.split(','))
			.filter((a) => a.length >= 2);
		for (const r of rows) {
			const [code, name] = r;
			const { error } = await supabaseAdmin
				.from('esco_occupations')
				.upsert({ code, name }, { onConflict: 'code' });
			if (error) logger.error('ESCO occupation upsert failed', { code, error });
		}
		logger.info('ESCO occupations ingested', { count: rows.length });
	}
}

main();
