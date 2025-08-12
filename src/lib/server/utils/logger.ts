type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
type LogContext = Record<string, unknown>;

/**
 * The core logging function.
 * @param level The severity level of the log.
 * @param message The main log message.
 * @param context Optional additional data to include in the log.
 */
function log(level: LogLevel, message: string, context: LogContext = {}): void {
	// If an error object is passed in the context, extract its message and stack for better logging
	if (context.error && context.error instanceof Error) {
		context.errorMessage = context.error.message;
		context.errorStack = context.error.stack;
		delete context.error; // Avoid redundant logging of the full object
	}

	const logObject = {
		timestamp: new Date().toISOString(),
		level,
		message,
		...context
	};

	const logString = JSON.stringify(logObject);

	switch (level) {
		case 'DEBUG':
			// Debug logs are only shown if a specific environment variable is set
			if (process.env.NODE_ENV === 'development') {
				console.debug(logString);
			}
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

export const logger = {
	debug: (message: string, context?: LogContext) => log('DEBUG', message, context),
	info: (message: string, context?: LogContext) => log('INFO', message, context),
	warn: (message: string, context?: LogContext) => log('WARN', message, context),
	error: (message: string, context?: LogContext) => log('ERROR', message, context)
};