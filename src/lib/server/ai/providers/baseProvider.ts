import type { GeneratedIDP } from '$lib/types/schemas';

/**
 * Opsi konfigurasi standar untuk setiap provider AI.
 */
export interface AIProviderConfig {
	apiKey: string;
	apiEndpoint: string;
}

/**
 * Antarmuka (Interface) yang mendefinisikan "kontrak" untuk semua provider AI.
 * Setiap provider yang kita buat (Azure, Gemini, Claude, dll.) HARUS
 * mengimplementasikan metode-metode ini. Ini memastikan konsistensi
 * dan memungkinkan kita untuk menukar provider dengan mudah.
 */
export interface AIProvider {
	/**
	 * Menghasilkan konten terstruktur (IDP) berdasarkan prompt.
	 * @param prompt - String prompt yang lengkap.
	 * @returns Sebuah promise yang resolve menjadi objek GeneratedIDP.
	 * @throws {Error} Jika terjadi kegagalan pada API call.
	 */
	generateStructuredContent(prompt: string): Promise<GeneratedIDP>;

	/**
	 * Menghasilkan embedding vektor dari sebuah teks.
	 * @param text - Teks yang akan di-embed.
	 * @returns Sebuah promise yang resolve menjadi array angka (vektor).
	 * @throws {Error} Jika terjadi kegagalan pada API call.
	 */
	generateEmbedding(text: string): Promise<number[]>;
}