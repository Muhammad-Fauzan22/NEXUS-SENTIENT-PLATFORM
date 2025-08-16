// src/hooks.server.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

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