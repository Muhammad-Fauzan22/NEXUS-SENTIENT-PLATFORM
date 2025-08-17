import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiManager } from '$lib/server/services/ai.manager';
import { supabaseAdmin } from '$lib/server/supabase';
import { logger } from '$lib/server/utils/logger';
import { handleError, createErrorResponse } from '$lib/server/utils/errors';

export const GET: RequestHandler = async () => {
	const correlationId = crypto.randomUUID();
	const requestLogger = logger.child({ correlationId, endpoint: '/api/health' });

	try {
		requestLogger.info('Health check initiated');

		const checks = await Promise.allSettled([
			// Database health check
			checkDatabase(),
			// AI services health check
			aiManager.healthCheck(),
			// Memory usage check
			checkSystemHealth()
		]);

		const [dbResult, aiResult, systemResult] = checks;

		const health = {
			status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
			timestamp: new Date().toISOString(),
			correlationId,
			services: {
				database:
					dbResult.status === 'fulfilled'
						? dbResult.value
						: { status: 'unhealthy', error: dbResult.reason },
				ai:
					aiResult.status === 'fulfilled'
						? aiResult.value
						: { status: 'unhealthy', error: aiResult.reason },
				system:
					systemResult.status === 'fulfilled'
						? systemResult.value
						: { status: 'unhealthy', error: systemResult.reason }
			}
		};

		// Determine overall health status
		const serviceStatuses = Object.values(health.services).map((service) => service.status);
		if (serviceStatuses.every((status) => status === 'healthy')) {
			health.status = 'healthy';
		} else if (serviceStatuses.some((status) => status === 'healthy')) {
			health.status = 'degraded';
		} else {
			health.status = 'unhealthy';
		}

		const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

		requestLogger.info('Health check completed', {
			status: health.status,
			statusCode,
			services: serviceStatuses
		});

		return json(health, { status: statusCode });
	} catch (error) {
		const apiError = handleError(error, { correlationId, endpoint: '/api/health' });
		requestLogger.error('Health check failed', { error: apiError.message });

		return json(createErrorResponse(apiError), { status: apiError.status });
	}
};

async function checkDatabase() {
	try {
		const { error } = await supabaseAdmin.from('processed_profiles').select('id').limit(1);

		if (error) {
			throw new Error(`Database query failed: ${error.message}`);
		}

		return {
			status: 'healthy' as const,
			responseTime: Date.now(),
			details: 'Database connection successful'
		};
	} catch (error) {
		return {
			status: 'unhealthy' as const,
			error: error instanceof Error ? error.message : 'Unknown database error'
		};
	}
}

async function checkSystemHealth() {
	try {
		const memoryUsage = process.memoryUsage();
		const uptime = process.uptime();

		// Convert bytes to MB
		const memoryMB = {
			rss: Math.round(memoryUsage.rss / 1024 / 1024),
			heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
			heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
			external: Math.round(memoryUsage.external / 1024 / 1024)
		};

		// Simple health thresholds
		const isHealthy = memoryMB.heapUsed < 512; // Less than 512MB heap usage

		return {
			status: isHealthy ? ('healthy' as const) : ('degraded' as const),
			uptime: Math.round(uptime),
			memory: memoryMB,
			nodeVersion: process.version
		};
	} catch (error) {
		return {
			status: 'unhealthy' as const,
			error: error instanceof Error ? error.message : 'Unknown system error'
		};
	}
}
