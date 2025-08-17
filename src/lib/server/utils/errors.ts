import { ZodError } from 'zod';
import { logger } from './logger';

export interface ErrorContext {
	transactionId?: string;
	userId?: string;
	endpoint?: string;
	timestamp?: string;
	[key: string]: unknown;
}

export class ApiError extends Error {
	public readonly status: number;
	public readonly context?: ErrorContext;
	public readonly isOperational: boolean;

	constructor(status: number, message: string, context?: ErrorContext, isOperational = true) {
		super(message);
		this.status = status;
		this.context = {
			...context,
			timestamp: new Date().toISOString()
		};
		this.isOperational = isOperational;
		this.name = this.constructor.name;

		// Log error automatically
		logger.error(`${this.constructor.name}: ${message}`, {
			status: this.status,
			context: this.context,
			stack: this.stack
		});
	}
}

export class BadRequestError extends ApiError {
	constructor(message = 'Bad Request', context?: ErrorContext) {
		super(400, message, context);
	}
}

export class UnauthorizedError extends ApiError {
	constructor(message = 'Unauthorized', context?: ErrorContext) {
		super(401, message, context);
	}
}

export class ForbiddenError extends ApiError {
	constructor(message = 'Forbidden', context?: ErrorContext) {
		super(403, message, context);
	}
}

export class NotFoundError extends ApiError {
	constructor(message = 'Not Found', context?: ErrorContext) {
		super(404, message, context);
	}
}

export class ConflictError extends ApiError {
	constructor(message = 'Conflict', context?: ErrorContext) {
		super(409, message, context);
	}
}

export class ZodValidationError extends ApiError {
	constructor(error: ZodError, transactionId?: string) {
		const errors = error.flatten().fieldErrors;
		const message = 'Input validation failed.';
		super(400, message, { transactionId, errors });
	}
}

export class InternalServerError extends ApiError {
	constructor(message = 'Internal Server Error', context?: ErrorContext) {
		super(500, message, context);
	}
}

export class ServiceUnavailableError extends ApiError {
	constructor(message = 'Service Unavailable', context?: ErrorContext) {
		super(503, message, context);
	}
}

export class AIProviderError extends ApiError {
	constructor(message = 'AI Provider Error', context?: ErrorContext) {
		super(502, message, context);
	}
}

export class DatabaseError extends ApiError {
	constructor(message = 'Database Error', context?: ErrorContext) {
		super(500, message, context);
	}
}

/**
 * Error handler utility for consistent error responses
 */
export function handleError(error: unknown, context?: ErrorContext): ApiError {
	if (error instanceof ApiError) {
		return error;
	}

	if (error instanceof ZodError) {
		return new ZodValidationError(error, context?.transactionId);
	}

	if (error instanceof Error) {
		logger.error('Unhandled error converted to InternalServerError', {
			originalError: error.message,
			stack: error.stack,
			context
		});
		return new InternalServerError(error.message, context);
	}

	logger.error('Unknown error type converted to InternalServerError', {
		error,
		context
	});
	return new InternalServerError('An unknown error occurred', context);
}

/**
 * Utility to create error response objects
 */
export function createErrorResponse(error: ApiError) {
	return {
		error: {
			message: error.message,
			status: error.status,
			context: error.context,
			timestamp: new Date().toISOString()
		}
	};
}
