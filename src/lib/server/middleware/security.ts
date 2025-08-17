import { logger } from '$lib/server/utils/logger';
import { BadRequestError, UnauthorizedError } from '$lib/server/utils/errors';
import type { RequestEvent } from '@sveltejs/kit';

export interface RateLimitConfig {
	windowMs: number;
	maxRequests: number;
	skipSuccessfulRequests?: boolean;
}

class RateLimiter {
	private requests = new Map<string, { count: number; resetTime: number }>();

	isAllowed(identifier: string, config: RateLimitConfig): boolean {
		const now = Date.now();
		const windowStart = now - config.windowMs;

		// Clean up old entries
		this.cleanup(windowStart);

		const userRequests = this.requests.get(identifier);

		if (!userRequests) {
			this.requests.set(identifier, { count: 1, resetTime: now + config.windowMs });
			return true;
		}

		if (now > userRequests.resetTime) {
			// Reset window
			this.requests.set(identifier, { count: 1, resetTime: now + config.windowMs });
			return true;
		}

		if (userRequests.count >= config.maxRequests) {
			return false;
		}

		userRequests.count++;
		return true;
	}

	private cleanup(windowStart: number): void {
		for (const [key, value] of this.requests.entries()) {
			if (value.resetTime < windowStart) {
				this.requests.delete(key);
			}
		}
	}
}

const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
	return (event: RequestEvent) => {
		const identifier = event.getClientAddress();
		const isAllowed = rateLimiter.isAllowed(identifier, config);

		if (!isAllowed) {
			logger.warn('Rate limit exceeded', {
				ip: identifier,
				url: event.url.pathname,
				userAgent: event.request.headers.get('user-agent')
			});

			throw new BadRequestError('Rate limit exceeded. Please try again later.');
		}
	};
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: unknown): unknown {
	if (typeof input === 'string') {
		// Remove potentially dangerous characters
		return input
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/<[^>]*>/g, '')
			.trim();
	}

	if (Array.isArray(input)) {
		return input.map(sanitizeInput);
	}

	if (input && typeof input === 'object') {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(input)) {
			sanitized[key] = sanitizeInput(value);
		}
		return sanitized;
	}

	return input;
}

/**
 * CORS headers
 */
export function setCorsHeaders(response: Response, origin?: string): Response {
	const allowedOrigins = [
		'http://localhost:5173',
		'http://localhost:4173',
		'https://nexus-platform.vercel.app'
	];

	const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

	response.headers.set('Access-Control-Allow-Origin', corsOrigin);
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	response.headers.set('Access-Control-Max-Age', '86400');

	return response;
}

/**
 * Security headers
 */
export function setSecurityHeaders(response: Response): Response {
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
}

/**
 * Authentication middleware
 */
export async function requireAuth(event: RequestEvent): Promise<void> {
	const session = event.locals.session;

	if (!session?.user) {
		logger.warn('Unauthorized access attempt', {
			ip: event.getClientAddress(),
			url: event.url.pathname,
			userAgent: event.request.headers.get('user-agent')
		});

		throw new UnauthorizedError('Authentication required');
	}
}

/**
 * API key validation
 */
export function validateApiKey(event: RequestEvent, requiredKey?: string): void {
	if (!requiredKey) return;

	const apiKey = event.request.headers.get('x-api-key') || event.url.searchParams.get('api_key');

	if (!apiKey || apiKey !== requiredKey) {
		logger.warn('Invalid API key', {
			ip: event.getClientAddress(),
			url: event.url.pathname,
			providedKey: apiKey ? 'provided' : 'missing'
		});

		throw new UnauthorizedError('Invalid API key');
	}
}
