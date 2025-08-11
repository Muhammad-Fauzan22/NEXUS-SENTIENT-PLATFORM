import { json } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { logger } from './logger';
import { dev } from '$app/environment';

// --- Kelas Error Terstruktur ---

/**
 * Kelas dasar untuk semua error API yang terstandarisasi.
 */
export class ApiError extends Error {
	public readonly statusCode: number;
	public readonly errorCode: string;

	constructor(statusCode: number, errorCode: string, message: string) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class BadRequestError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(400, errorCode, message);
	}
}

export class UnauthorizedError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(401, errorCode, message);
	}
}

export class ForbiddenError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(403, errorCode, message);
	}
}

export class NotFoundError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(404, errorCode, message);
	}
}

export class InternalServerError extends ApiError {
	constructor(message: string = 'Terjadi kesalahan internal pada server.') {
		super(500, 'INTERNAL_SERVER_ERROR', message);
	}
}


// --- Penangan Error Terpusat ---

/**
 * Penangan error API terpusat. Mencatat error dan mengembalikan respons JSON yang terstandardisasi.
 * @param error - Objek error yang ditangkap.
 * @param transactionId - ID unik untuk permintaan, digunakan untuk pelacakan.
 * @returns Objek Response SvelteKit.
 */
export function handleApiError(error: unknown, transactionId: string): Response {
	if (error instanceof ApiError) {
		logger.warn({ transactionId, err: { code: error.errorCode, status: error.statusCode } }, `ApiError: ${error.message}`);
		return json(
			{
				success: false,
				message: error.message,
				errorCode: error.errorCode,
			},
			{ status: error.statusCode }
		);
	}

	if (error instanceof ZodError) {
		const validationErrors = error.flatten().fieldErrors;
		logger.warn({ transactionId, errors: validationErrors }, `Zod Validation Error`);
		return json(
			{
				success: false,
				message: 'Input tidak valid.',
				details: validationErrors,
			},
			{ status: 400 }
		);
	}

	const e = error as Error;
	logger.error({ transactionId, err: e }, `Unhandled Internal Server Error: ${e.message}`);

	const responseBody = {
		success: false,
		message: 'Terjadi kesalahan internal pada server.',
		details: dev ? { error: e.message, stack: e.stack } : undefined,
	};

	return json(responseBody, { status: 500 });
}
