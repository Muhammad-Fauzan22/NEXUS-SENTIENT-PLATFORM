import fs from 'node:fs';
import path from 'node:path';
import { supabaseAdmin } from './utils/supabase.admin.ts';
import { logger } from '../src/lib/server/utils/logger';
import {
	extractSkillsV2,
	computeVelocity,
	normalizeSkill
} from '../src/lib/server/analytics/trends_analyzer';

const JOB_DESC_DIR = path.resolve(process.cwd(), 'datasets', 'job-descriptions');

async function analyze() {
	logger.info('Trend analyzer V2 started');
	const files = fs.existsSync(JOB_DESC_DIR)
		? fs
				.readdirSync(JOB_DESC_DIR)
				.map((f) => path.join(JOB_DESC_DIR, f))
				.filter((p) => p.endsWith('.csv') || p.endsWith('.json') || p.endsWith('.txt'))
		: [];

	const counts7 = new Map<string, number>();
	const counts30 = new Map<string, number>();

	for (const file of files) {
		try {
			const content = fs.readFileSync(file, 'utf8');
			let text = content;
			if (file.endsWith('.json')) {
				const js = JSON.parse(content);
				if (Array.isArray(js)) {
					text = js.map((r: any) => [r.title, r.description, r.summary].join(' ')).join('\n');
				}
			}
			const skills = extractSkillsV2(text);
			for (const s of skills) {
				const key = normalizeSkill(s);
				counts7.set(key, (counts7.get(key) || 0) + 1);
				counts30.set(key, (counts30.get(key) || 0) + 1);
			}
		} catch (e) {
			logger.warn('Failed to analyze file', { file, error: (e as Error).message });
		}
	}

	const entries = Array.from(counts30.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 300);

	for (const [skill, cnt30] of entries) {
		const cnt7 = counts7.get(skill) || 0;
		const velocity = computeVelocity(cnt7, cnt30);
		const related_roles = 'engineering,mechanical,software,ai,robotics';
		const { error } = await supabaseAdmin.from('skill_trends').upsert(
			{
				skill_name: skill,
				mention_count_7d: cnt7,
				mention_count_30d: cnt30,
				velocity_score: velocity,
				related_roles
			},
			{ onConflict: 'skill_name' }
		);
		if (error) logger.error('Upsert skill trend failed', { skill, error });
	}
	logger.info('Trend analyzer V2 completed', { updated: entries.length });
}

analyze();
