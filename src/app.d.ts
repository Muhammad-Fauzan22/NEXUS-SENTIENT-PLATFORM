// See https://kit.svelte.dev/docs/types#app for information about these interfaces
// and what to do when importing types

import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<any, any, any>;
			getSession: () => Promise<Session | null>;
		}
		// interface PageData {}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
