import { ZodError } from 'zod';
import { logger } from './logger';

/**
 * Base class for custom API errors.
 */
export class ApiError extends Error {
	public readonly status: number;
	public readonly context?: Record<string, unknown>;

	constructor(status: number, message: string, context?: Record<string, unknown>) {
		super(message);
		this.status = status;
		this.context = context;
		this.name = this.constructor.name;
	}
}

/**
 * Represents a 400 Bad Request error.
 */
export class BadRequestError extends ApiError {
	constructor(message = 'Bad Request', context?: Record<string, unknown>) {
		super(400, message, context);
	}
}

/**
 * Handles Zod validation errors, converting them into a 400 Bad Request.
 */
export class ZodValidationError extends ApiError {
	constructor(error: ZodError, transactionId: string) {
		const errors = error.flatten().fieldErrors;
		const message = 'Input validation failed.';
		logger.warn(message, { transactionId, errors });
		super(400, message, { errors });
	}
}

/**
 * Represents a 500 Internal Server Error.
 */
export class InternalServerError extends ApiError {
	constructor(message = 'Internal Server Error', context?: Record<string, unknown>) {
		super(500, message, context);
	}
}