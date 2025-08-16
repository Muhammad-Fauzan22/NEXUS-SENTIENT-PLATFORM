// src/routes/+layout.ts
import type { PageLoad } from './$types';
import { supabase } from '$lib/db/supabase';

export const load: PageLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch }
	});

	const {
		data: { session },
	} = await supabase.auth.getSession();

	return { supabase, session };
};