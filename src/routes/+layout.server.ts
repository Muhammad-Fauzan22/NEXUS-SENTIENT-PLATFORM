// src/routes/+layout.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }: { locals: App.Locals }) => {
	return {
		session: await locals.getSession()
	};
};
