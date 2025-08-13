// src/routes/+layout.ts
import { createBrowserClient } from '@supabase/ssr';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createBrowserClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: {
				fetch,
			},
		}
	);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	return { supabase, session };
};