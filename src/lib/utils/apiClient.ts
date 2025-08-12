/**
 * Struktur error standar yang diharapkan dari endpoint API backend.
 */
interface ApiErrorResponse {
	message: string;
	[key: string]: unknown; // Memungkinkan properti tambahan untuk konteks error.
}

/**
 * Fungsi inti untuk semua permintaan API dari sisi klien.
 * Mengenkapsulasi logika fetch, pengaturan header, penanganan body, dan standardisasi error.
 *
 * @param method Metode HTTP yang akan digunakan.
 * @param path Endpoint API yang dituju (misalnya, '/api/assessment/submit').
 * @param data Data opsional untuk dikirim dalam body permintaan.
 * @returns Promise yang me-resolve dengan data JSON dari respons.
 * @throws Error dengan pesan dari server jika permintaan gagal.
 */
async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: unknown): Promise<T> {
	const opts: RequestInit = {
		method,
		headers: {}
	};

	if (data) {
		opts.headers = { 'Content-Type': 'application/json' };
		opts.body = JSON.stringify(data);
	}

	const response = await fetch(path, opts);

	if (response.ok) {
		// Menangani respons tanpa konten (misalnya, status 204 No Content)
		// dengan mengembalikan null, yang merupakan perilaku yang valid.
		const text = await response.text();
		return text ? (JSON.parse(text) as T) : (null as T);
	}

	// Menangani respons error.
	let errorPayload: ApiErrorResponse | null = null;
	try {
		errorPayload = await response.json();
	} catch (e) {
		// Jika body error bukan JSON, lemparkan error HTTP standar.
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	// Lemparkan error dengan pesan yang informatif dari backend.
	throw new Error(errorPayload?.message || `HTTP ${response.status}: An unknown error occurred.`);
}

// --- Metode Helper yang Diekspor ---

export const apiClient = {
	get: <T>(path: string): Promise<T> => request<T>('GET', path),
	post: <T>(path: string, data: unknown): Promise<T> => request<T>('POST', path, data),
	put: <T>(path: string, data: unknown): Promise<T> => request<T>('PUT', path, data),
	del: <T>(path: string): Promise<T> => request<T>('DELETE', path)
};