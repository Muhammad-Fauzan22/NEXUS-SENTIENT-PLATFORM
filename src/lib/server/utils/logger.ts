
/**
 * The core logging function. Avoid using this directly.
 * @param level The severity level of the log.
 * @param message The main log message.
 * @param context Optional additional data to include in the log.
 */
function log(level: LogLevel, message: string, context: LogContext = {}): void {
	const logObject = {
		timestamp: new Date().toISOString(),
		level,
		message,
		...context
	};

	const logString = JSON.stringify(logObject);

	switch (level) {
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

/**
 * Logs an informational message. Use for general application flow events.
 * @param message The main log message.
 * @param context Optional additional data.
 */
export function info(message: string, context?: LogContext): void {
	log('INFO', message, context);
}

/**
 * Logs a warning message. Use for non-critical issues that should be investigated.
 * @param message The main log message.
 * @param context Optional additional data.
 */
export function warn(message: string, context?: LogContext): void {
	log('WARN', message, context);
}

/**
 * Logs an error message. Use for critical failures, exceptions, and unexpected states.
 * @param message The main log message.
 * @param context Optional additional data, often including an error object.
 */
export function error(message: string, context?: LogContext): void {
	log('ERROR', message, context);
}

export const logger = {
	info,
	warn,
	error
};