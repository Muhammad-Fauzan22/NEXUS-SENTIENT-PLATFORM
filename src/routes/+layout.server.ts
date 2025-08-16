// src/routes/+layout.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
	return {
		session: await getSession()
	};
};

