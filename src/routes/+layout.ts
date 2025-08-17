// src/routes/+layout.ts
import type { PageLoad } from './$types';
import { supabase } from '$lib/client/supabase';

export const load: PageLoad = async ({ depends }: { depends: (key: string) => void }) => {
	depends('supabase:auth');
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return { supabase, session };
};