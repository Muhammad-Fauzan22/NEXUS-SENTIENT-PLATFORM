import { ZodError } from 'zod';
import { logger } from './logger';
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
export class BadRequestError extends ApiError {
	constructor(message = 'Bad Request', context?: Record<string, unknown>) {
		super(400, message, context);
	}
}
export class ZodValidationError extends ApiError {
	constructor(error: ZodError, transactionId: string) {
		const errors = error.flatten().fieldErrors;
		const message = 'Input validation failed.';
		logger.warn(message, { transactionId, errors });
		super(400, message, { errors });
	}
}
export class InternalServerError extends ApiError {
	constructor(message = 'Internal Server Error', context?: Record<string, unknown>) {
		super(500, message, context);
	}
}