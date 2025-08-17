import { logger } from './logger';

export interface PerformanceMetrics {
	operation: string;
	duration: number;
	timestamp: string;
	success: boolean;
	metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
	private metrics: PerformanceMetrics[] = [];
	private readonly maxMetrics = 1000; // Keep last 1000 metrics in memory

	/**
	 * Time an async operation
	 */
	async timeAsync<T>(
		operation: string,
		fn: () => Promise<T>,
		metadata?: Record<string, unknown>
	): Promise<T> {
		const startTime = Date.now();
		const timer = logger.time(operation, metadata);

		try {
			const result = await fn();
			const duration = Date.now() - startTime;

			this.recordMetric({
				operation,
				duration,
				timestamp: new Date().toISOString(),
				success: true,
				metadata
			});

			timer();
			return result;
		} catch (error) {
			const duration = Date.now() - startTime;

			this.recordMetric({
				operation,
				duration,
				timestamp: new Date().toISOString(),
				success: false,
				metadata: {
					...metadata,
					error: error instanceof Error ? error.message : 'Unknown error'
				}
			});

			timer();
			throw error;
		}
	}

	/**
	 * Time a synchronous operation
	 */
	timeSync<T>(operation: string, fn: () => T, metadata?: Record<string, unknown>): T {
		const startTime = Date.now();

		try {
			const result = fn();
			const duration = Date.now() - startTime;

			this.recordMetric({
				operation,
				duration,
				timestamp: new Date().toISOString(),
				success: true,
				metadata
			});

			return result;
		} catch (error) {
			const duration = Date.now() - startTime;

			this.recordMetric({
				operation,
				duration,
				timestamp: new Date().toISOString(),
				success: false,
				metadata: {
					...metadata,
					error: error instanceof Error ? error.message : 'Unknown error'
				}
			});

			throw error;
		}
	}

	/**
	 * Record a performance metric
	 */
	private recordMetric(metric: PerformanceMetrics): void {
		this.metrics.push(metric);

		// Keep only the last N metrics to prevent memory leaks
		if (this.metrics.length > this.maxMetrics) {
			this.metrics = this.metrics.slice(-this.maxMetrics);
		}

		// Log slow operations
		if (metric.duration > 5000) {
			// 5 seconds
			logger.warn(`Slow operation detected: ${metric.operation}`, {
				duration: metric.duration,
				success: metric.success,
				metadata: metric.metadata
			});
		}
	}

	/**
	 * Get performance statistics
	 */
	getStats(operation?: string): {
		totalOperations: number;
		successRate: number;
		averageDuration: number;
		minDuration: number;
		maxDuration: number;
		p95Duration: number;
		recentOperations: PerformanceMetrics[];
	} {
		const filteredMetrics = operation
			? this.metrics.filter((m) => m.operation === operation)
			: this.metrics;

		if (filteredMetrics.length === 0) {
			return {
				totalOperations: 0,
				successRate: 0,
				averageDuration: 0,
				minDuration: 0,
				maxDuration: 0,
				p95Duration: 0,
				recentOperations: []
			};
		}

		const durations = filteredMetrics.map((m) => m.duration).sort((a, b) => a - b);
		const successCount = filteredMetrics.filter((m) => m.success).length;

		return {
			totalOperations: filteredMetrics.length,
			successRate: (successCount / filteredMetrics.length) * 100,
			averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
			minDuration: durations[0],
			maxDuration: durations[durations.length - 1],
			p95Duration: durations[Math.floor(durations.length * 0.95)],
			recentOperations: filteredMetrics.slice(-10) // Last 10 operations
		};
	}

	/**
	 * Clear all metrics
	 */
	clearMetrics(): void {
		this.metrics = [];
		logger.info('Performance metrics cleared');
	}
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for timing class methods
 */
export function timed(operation?: string) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		const operationName = operation || `${target.constructor.name}.${propertyKey}`;

		descriptor.value = async function (...args: any[]) {
			return performanceMonitor.timeAsync(operationName, () => originalMethod.apply(this, args), {
				className: target.constructor.name,
				methodName: propertyKey
			});
		};

		return descriptor;
	};
}
