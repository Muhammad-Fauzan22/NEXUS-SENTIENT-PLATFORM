// src/routes/+layout.ts
import type { PageLoad } from './$types';
import { supabase } from '$lib/db/supabase';

export const load: PageLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	// supabase client is provided from server-side env via $lib/db/supabase


	const {
		data: { session },
	} = await supabase.auth.getSession();

	return { supabase, session };
};