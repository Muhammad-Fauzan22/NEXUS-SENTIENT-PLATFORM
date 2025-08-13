// src/hooks.server.ts
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Inisialisasi Supabase client untuk setiap request
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: env.SUPABASE_URL,
		supabaseKey: env.SUPABASE_ANON_KEY,
		event,
	});

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