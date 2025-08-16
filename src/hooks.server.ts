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

	// Rate limit sederhana per IP
	const ip = event.getClientAddress?.() || event.request.headers.get('x-forwarded-for') || undefined;
	if (!checkRateLimit(ip)) {
		return new Response('Too Many Requests', { status: 429 });
	}

	// Header keamanan dasar + CSP ketat
	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});

	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data:",
		"connect-src 'self'",
		"font-src 'self' data:",
		"frame-ancestors 'none'"
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	// HSTS hanya bila HTTPS; jika deploy di HTTPS, aktifkan:
	// response.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');

	return response;
};