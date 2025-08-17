import { env } from '$env/dynamic/private';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type LogContext = Record<string, unknown>;

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	service: string;
	environment: string;
	correlationId?: string;
	userId?: string;
	sessionId?: string;
	context?: LogContext;
}

class Logger {
	private readonly service: string;
	private readonly environment: string;
	private readonly logLevel: LogLevel;

	constructor(service = 'nexus-platform') {
		this.service = service;
		this.environment = env.NODE_ENV || 'development';
		this.logLevel = (env.LOG_LEVEL as LogLevel) || 'INFO';
	}

	private shouldLog(level: LogLevel): boolean {
		const levels: Record<LogLevel, number> = {
			DEBUG: 0,
			INFO: 1,
			WARN: 2,
			ERROR: 3
		};
		return levels[level] >= levels[this.logLevel];
	}

	private formatLog(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
		return {
			timestamp: new Date().toISOString(),
			level,
			message,
			service: this.service,
			environment: this.environment,
			correlationId: context.correlationId as string,
			userId: context.userId as string,
			sessionId: context.sessionId as string,
			context: { ...context }
		};
	}

	private writeLog(logEntry: LogEntry): void {
		const logString = JSON.stringify(logEntry, null, this.environment === 'development' ? 2 : 0);
		
		switch (logEntry.level) {
			case 'DEBUG':
				console.debug(logString);
				break;
			case 'INFO':
				console.info(logString);
				break;
			case 'WARN':
				console.warn(logString);
				break;
			case 'ERROR':
				console.error(logString);
				break;
		}
	}

	debug(message: string, context?: LogContext): void {
		if (this.shouldLog('DEBUG')) {
			this.writeLog(this.formatLog('DEBUG', message, context));
		}
	}

	info(message: string, context?: LogContext): void {
		if (this.shouldLog('INFO')) {
			this.writeLog(this.formatLog('INFO', message, context));
		}
	}

	warn(message: string, context?: LogContext): void {
		if (this.shouldLog('WARN')) {
			this.writeLog(this.formatLog('WARN', message, context));
		}
	}

	error(message: string, context?: LogContext): void {
		if (this.shouldLog('ERROR')) {
			this.writeLog(this.formatLog('ERROR', message, context));
		}
	}

	/**
	 * Create a child logger with additional context
	 */
	child(additionalContext: LogContext): Logger {
		const childLogger = new Logger(this.service);
		const originalMethods = {
			debug: childLogger.debug.bind(childLogger),
			info: childLogger.info.bind(childLogger),
			warn: childLogger.warn.bind(childLogger),
			error: childLogger.error.bind(childLogger)
		};

		childLogger.debug = (message: string, context?: LogContext) => 
			originalMethods.debug(message, { ...additionalContext, ...context });
		childLogger.info = (message: string, context?: LogContext) => 
			originalMethods.info(message, { ...additionalContext, ...context });
		childLogger.warn = (message: string, context?: LogContext) => 
			originalMethods.warn(message, { ...additionalContext, ...context });
		childLogger.error = (message: string, context?: LogContext) => 
			originalMethods.error(message, { ...additionalContext, ...context });

		return childLogger;
	}

	/**
	 * Performance timing utility
	 */
	time(label: string, context?: LogContext): () => void {
		const start = Date.now();
		this.debug(`Timer started: ${label}`, context);
		
		return () => {
			const duration = Date.now() - start;
			this.info(`Timer finished: ${label}`, { ...context, duration });
		};
	}
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating specialized loggers
export { Logger };