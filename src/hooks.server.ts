// src/hooks.server.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
// Simple in-memory rate limit (per-IP)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 req/min per IP
const hits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string | null | undefined): boolean {
	if (!ip) return true; // if IP not available, skip
	const now = Date.now();
	const rec = hits.get(ip) ?? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
	if (now > rec.resetAt) {
		rec.count = 0;
		rec.resetAt = now + RATE_LIMIT_WINDOW_MS;
	}
	rec.count++;
	hits.set(ip, rec);
	return rec.count <= RATE_LIMIT_MAX;
}


export const handle: Handle = async ({ event, resolve }) => {
	// Inisialisasi Supabase client untuk setiap request
	event.locals.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

	// Definisikan getter untuk sesi pengguna
	event.locals.getSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	// Resolve request dengan transformasi header yang direkomendasikan
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		},
	});
};