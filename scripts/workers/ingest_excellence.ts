import fs from 'node:fs';
import path from 'node:path';
import glob from 'fast-glob';
import crypto from 'node:crypto';
import { supabaseAdmin } from '../../src/lib/server/supabase';
import { logger } from '../../src/lib/server/utils/logger';
import { getEmbedding } from '../utils/embedding';

function hash(text: string) {
	return crypto.createHash('sha256').update(text).digest('hex');
}

async function upsertDoc(row: any) {
	const { error } = await supabaseAdmin
		.from('excellence_docs')
		.upsert(row, { onConflict: 'content_hash' });
	if (error)
		logger.error('excellence upsert failed', { error, row_meta: { url: row.url, path: row.path } });
}

async function ingestMarkdownDir(
	baseDir: string,
	source: string,
	urlBase?: string,
	tags: string[] = []
) {
	const files = await glob('**/*.{md,mdx,markdown}', { cwd: baseDir, absolute: true });
	for (const f of files) {
		const content = fs.readFileSync(f, 'utf8');
		const h = hash(content);
		const emb = await getEmbedding(content.slice(0, 5000));
		const rel = path.relative(baseDir, f).replaceAll('\\', '/');
		await upsertDoc({
			source,
			path: rel,
			url: urlBase ? `${urlBase}/${rel}` : null,
			title: path.basename(f),
			tags,
			content,
			content_hash: h,
			embedding: emb
		});
	}
}

async function ingestCodeDir(
	baseDir: string,
	repoUrl: string,
	repoName: string,
	exts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.c', '.cc', '.cpp']
) {
	const files = await glob(`**/*{${exts.join(',')}}`, { cwd: baseDir, absolute: true });
	for (const f of files) {
		const content = fs.readFileSync(f, 'utf8');
		if (!content.trim()) continue;
		const h = hash(content);
		const emb = await getEmbedding(content.slice(0, 5000));
		const rel = path.relative(baseDir, f).replaceAll('\\', '/');
		await upsertDoc({
			source: 'code_repo',
			source_id: repoName,
			path: rel,
			url: `${repoUrl}/blob/main/${rel}`,
			title: path.basename(f),
			tags: ['code'],
			content,
			content_hash: h,
			embedding: emb
		});
	}
}

async function main() {
	// Example: ingest awesome lists as knowledge
	const awesome = path.resolve(process.cwd(), 'datasets', 'language', 'awesome-lists', 'awesome');
	if (fs.existsSync(awesome)) {
		await ingestMarkdownDir(awesome, 'web_doc', 'https://github.com/sindresorhus/awesome', [
			'awesome',
			'catalog'
		]);
	}

	// Example: ingest code bases if cloned under ./datasets/code/*
	const codeBase = path.resolve(process.cwd(), 'datasets', 'code');
	if (fs.existsSync(codeBase)) {
		const repos = fs
			.readdirSync(codeBase, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		for (const r of repos) {
			const repoDir = path.join(codeBase, r);
			// Repo URL heuristic
			const repoUrl =
				r === 'vscode'
					? 'https://github.com/microsoft/vscode'
					: r === 'linux-kernel'
						? 'https://github.com/torvalds/linux'
						: '';
			await ingestCodeDir(repoDir, repoUrl, r);
		}
	}

	logger.info('Excellence ingestion finished');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
