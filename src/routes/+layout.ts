// src/routes/+layout.ts
import type { PageLoad } from './$types';
import { supabase } from '$lib/client/supabase';

export const load: PageLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	// client-only supabase; server load should not import this file during SSR



	const {
		data: { session },
	} = await supabase.auth.getSession();

	return { supabase, session };
};