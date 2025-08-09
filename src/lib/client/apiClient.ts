import { browser } from '$app/environment';

/**
 * Representasi terstruktur dari error yang diterima dari backend API kita.
 */
export interface ApiErrorResponse {
	error: string;
	details?: unknown;
}

/**
 * Kelas error kustom untuk kegagalan pada sisi klien saat memanggil API.
 * Menyimpan status HTTP dan respons error dari server.
 */
export class ApiClientError extends Error {
	public readonly status: number;
	public readonly response: ApiErrorResponse;

	constructor(status: number, response: ApiErrorResponse) {
		super(response.error || 'Terjadi kesalahan pada API');
		this.status = status;
		this.response = response;
	}
}

/**
 * Fungsi inti yang membungkus `fetch` untuk semua permintaan API.
 * @template T Tipe data yang diharapkan dari respons sukses.
 * @param {string} endpoint Path API, contoh: '/api/assessment/submit'.
 * @param {RequestInit} options Opsi `fetch` standar.
 * @returns {Promise<T>} Data dari respons yang sukses.
 * @throws {ApiClientError} Jika respons tidak OK.
 */
async function coreFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	if (!browser) {
		throw new Error('apiClient hanya dapat digunakan di sisi klien (browser).');
	}

	const headers = new Headers(options.headers);
	headers.set('Content-Type', 'application/json');

	// TODO: Integrasi dengan Supabase Auth Client
	// const { data: { session } } = await supabase.auth.getSession();
	// if (session) {
	//   headers.set('Authorization', `Bearer ${session.access_token}`);
	// }

	try {
		const response = await fetch(endpoint, {
			...options,
			headers
		});

		if (!response.ok) {
			const errorResponse: ApiErrorResponse = await response.json();
			throw new ApiClientError(response.status, errorResponse);
		}

		// Handle respons tanpa konten (misal: 204 No Content)
		if (response.status === 204) {
			return null as T;
		}

		return (await response.json()) as T;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		// Menangani network error atau error parsing JSON
		throw new ApiClientError(500, { error: 'Gagal terhubung ke server atau respons tidak valid.' });
	}
}

/**
 * Klien API yang diekspor untuk digunakan di seluruh frontend.
 * Menyediakan metode-metode HTTP yang umum dengan tipe yang aman.
 *
 * @example
 * import { apiClient } from '$lib/client/apiClient';
 *
 * try {
 *   const idp = await apiClient.post<GeneratedIDP>('/api/assessment/submit', assessmentData);
 *   console.log(idp.roadmap);
 * } catch (error) {
 *   if (error instanceof ApiClientError) {
 *     console.error(`API Error ${error.status}:`, error.response);
 *   }
 * }
 */
export const apiClient = {
	get: <T>(endpoint: string): Promise<T> => coreFetch<T>(endpoint, { method: 'GET' }),

	post: <T>(endpoint: string, body: unknown): Promise<T> =>
		coreFetch<T>(endpoint, {
			method: 'POST',
			body: JSON.stringify(body)
		}),

	put: <T>(endpoint: string, body: unknown): Promise<T> =>
		coreFetch<T>(endpoint, {
			method: 'PUT',
			body: JSON.stringify(body)
		}),

	delete: <T>(endpoint: string): Promise<T> => coreFetch<T>(endpoint, { method: 'DELETE' })
};