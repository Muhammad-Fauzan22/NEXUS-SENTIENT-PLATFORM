/**
 * Base class for custom API errors.
 * Contains an HTTP status code and optional context for logging.
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
 * Use when user input fails validation.
 */
export class BadRequestError extends ApiError {
	constructor(message = 'Bad Request', context?: Record<string, unknown>) {
		super(400, message, context);
	}
}

/**
 * Represents a 401 Unauthorized error.
 * Use when the user is not authenticated.
 */
export class UnauthorizedError extends ApiError {
	constructor(message = 'Unauthorized', context?: Record<string, unknown>) {
		super(401, message, context);
	}
}

/**
 * Represents a 403 Forbidden error.
 * Use when the user is authenticated but lacks permission.
 */
export class ForbiddenError extends ApiError {
	constructor(message = 'Forbidden', context?: Record<string, unknown>) {
		super(403, message, context);
	}
}

/**
 * Represents a 404 Not Found error.
 * Use when a resource cannot be found.
 */
export class NotFoundError extends ApiError {
	constructor(message = 'Not Found', context?: Record<string, unknown>) {
		super(404, message, context);
	}
}

/**
 * Represents a 500 Internal Server Error.
 * Use for unexpected server-side errors.
 */
export class InternalServerError extends ApiError {
	constructor(message = 'Internal Server Error', context?: Record<string, unknown>) {
		super(500, message, context);
	}
}