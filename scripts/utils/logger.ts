export const logger = {
  info: (message: string, context?: any) => console.log(JSON.stringify({ level: 'INFO', message, context })),
  warn: (message: string, context?: any) => console.warn(JSON.stringify({ level: 'WARN', message, context })),
  error: (message: string, context?: any) => console.error(JSON.stringify({ level: 'ERROR', message, context }))
};

