import pino from 'pino';
import { config } from '$lib/server/config';

// Opsi konfigurasi untuk pino logger
const pinoOptions: pino.LoggerOptions = {
	level: config.NODE_ENV === 'development' ? 'debug' : 'info',
};

// Di lingkungan pengembangan, gunakan 'pino-pretty' untuk log yang indah dan mudah dibaca.
// Di lingkungan produksi, gunakan format JSON standar untuk efisiensi dan integrasi
// dengan layanan log management (misalnya, Datadog, Logtail).
if (config.NODE_ENV === 'development') {
	pinoOptions.transport = {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
			ignore: 'pid,hostname'
		}
	};
}

/**
 * Instance logger terpusat untuk digunakan di seluruh backend.
 *
 * @example
 * import { logger } from '$lib/server/utils/logger';
 * logger.info('User %s logged in.', userId);
 * logger.warn({ orderId: '123' }, 'Order processing failed.');
 * logger.error(new Error('Database connection lost'), 'Fatal error.');
 */
export const logger = pino(pinoOptions);