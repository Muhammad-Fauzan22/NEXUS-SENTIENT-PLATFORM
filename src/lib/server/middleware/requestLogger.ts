import { logger } from '$lib/server/utils/logger';
import type { RequestEvent } from '@sveltejs/kit';

export interface RequestLogContext {
	correlationId: string;
	method: string;
	url: string;
	userAgent?: string;
	ip?: string;
	userId?: string;
	sessionId?: string;
}

/**
 * Creates a request logger with correlation ID and request context
 */
export function createRequestLogger(event: RequestEvent) {
	const correlationId = crypto.randomUUID();
	const method = event.request.method;
	const url = event.url.pathname + event.url.search;
	const userAgent = event.request.headers.get('user-agent') || undefined;
	const ip = event.getClientAddress();

	const context: RequestLogContext = {
		correlationId,
		method,
		url,
		userAgent,
		ip
	};

	// Add user context if available
	if ((event.locals as any).session?.user?.id) {
		context.userId = (event.locals as any).session.user.id;
	}

	const requestLogger = logger.child(context as any);

	// Log incoming request
	requestLogger.info('Request received', {
		headers: Object.fromEntries(event.request.headers.entries())
	});

	return {
		logger: requestLogger,
		correlationId,
		logResponse: (status: number, responseTime: number, error?: Error) => {
			const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
			const message = error ? `Request failed: ${error.message}` : 'Request completed';

			requestLogger[logLevel](message, {
				status,
				responseTime,
				error: error?.message
			});
		}
	};
}

/**
 * Performance timing decorator for API handlers
 */
export function withRequestLogging<T extends (...args: any[]) => Promise<Response>>(handler: T): T {
	return (async (...args: Parameters<T>) => {
		const event = args[0] as RequestEvent;
		const { logResponse } = createRequestLogger(event);
		const startTime = Date.now();

		try {
			const response = await handler(...args);
			const responseTime = Date.now() - startTime;

			logResponse(response.status, responseTime);

			return response;
		} catch (error) {
			const responseTime = Date.now() - startTime;
			const err = error instanceof Error ? error : new Error('Unknown error');

			logResponse(500, responseTime, err);

			throw error;
		}
	}) as T;
}
