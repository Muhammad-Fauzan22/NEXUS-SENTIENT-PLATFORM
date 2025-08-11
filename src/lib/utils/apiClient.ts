/**
 * A standardized error structure for API responses.
 */
interface ApiErrorResponse {
	message: string;
	[key: string]: unknown;
}

/**
 * The core request function for client-side API calls.
 * @param method The HTTP method (GET, POST, PUT, DELETE).
 * @param path The API endpoint path (e.g., '/api/assessment').
 * @param data Optional data to send in the request body.
 * @returns The JSON response from the API.
 * @throws An error with the message from the API if the request fails.
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
		// Handle cases with no content in the response body (e.g., 204 No Content)
		const text = await response.text();
		if (!text) {
			return null as T;
		}
		return JSON.parse(text) as T;
	}

	// Handle error responses
	let errorPayload: ApiErrorResponse | null = null;
	try {
		errorPayload = await response.json();
	} catch (e) {
		// The error response was not valid JSON
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	throw new Error(errorPayload?.message || `HTTP ${response.status}: An unknown error occurred.`);
}

/**
 * Performs a GET request.
 * @param path The API endpoint path.
 * @returns The JSON response from the API.
 */
export function get<T>(path: string): Promise<T> {
	return request<T>('GET', path);
}

/**
 * Performs a POST request.
 * @param path The API endpoint path.
 * @param data The data to send in the request body.
 * @returns The JSON response from the API.
 */
export function post<T>(path: string, data: unknown): Promise<T> {
	return request<T>('POST', path, data);
}

/**
 * Performs a PUT request.
 * @param path The API endpoint path.
 * @param data The data to send in the request body.
 * @returns The JSON response from the API.
 */
export function put<T>(path: string, data: unknown): Promise<T> {
	return request<T>('PUT', path, data);
}

/**
 * Performs a DELETE request.
 * @param path The API endpoint path.
 * @returns The JSON response from the API.
 */
export function del<T>(path: string): Promise<T> {
	return request<T>('DELETE', path);
}

export const apiClient = {
	get,
	post,
	put,
	del
};