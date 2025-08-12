import { createClient } from '@supabase/supabase-js';
import { env } from '$lib/server/config';

// Menggunakan modul konfigurasi server-side untuk menjaga satu sumber kebenaran,
// namun hanya mengakses kunci VITE_PUBLIC_* yang aman untuk diekspos ke browser.

const supabaseUrl = env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Instance singleton dari Supabase client yang telah diketik.
 *
 * Client ini menggunakan kunci 'anon' yang aman dan mematuhi kebijakan
 * Row Level Security (RLS) yang telah Anda definisikan.
 *
 * Aman untuk digunakan di kode sisi server (server-side rendering) maupun
 * di kode sisi klien (browser).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);