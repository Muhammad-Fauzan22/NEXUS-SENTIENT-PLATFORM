type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogContext = Record<string, unknown>;
function log(level: LogLevel, message: string, context: LogContext = {}): void {
	const logObject = { timestamp: new Date().toISOString(), level, message, ...context };
	const logString = JSON.stringify(logObject);
	if (level === 'INFO') console.info(logString);
	else if (level === 'WARN') console.warn(logString);
	else console.error(logString);
}
export const logger = {
	info: (message: string, context?: LogContext) => log('INFO', message, context),
	warn: (message: string, context?: LogContext) => log('WARN', message, context),
	error: (message: string, context?: LogContext) => log('ERROR', message, context)
};