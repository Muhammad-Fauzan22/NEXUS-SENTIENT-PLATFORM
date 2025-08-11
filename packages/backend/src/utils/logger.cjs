// packages/backend/src/utils/logger.cjs
// Konfigurasi logger terpusat menggunakan Pino untuk skrip backend.
// Mendukung level log dinamis, output JSON, dan pretty printing untuk development.

const pino = require('pino');

// --- Konfigurasi Logger ---
const isDevelopment = process.env.NODE_ENV === 'development';

// Opsi untuk pretty printing di mode development
const transport = isDevelopment
    ? pino.transport({
          target: 'pino-pretty',
          options: {
              colorize: true,
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
              ignore: 'pid,hostname',
          },
      })
    : undefined;

// Membuat instance logger
const logger = pino(
    {
        // Baca level log dari environment variable, default ke 'info'
        level: process.env.LOG_LEVEL || 'info',
        formatters: {
            level: (label) => {
                return { level: label.toUpperCase() };
            },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
);

// --- Logging Startup ---
logger.info(`Logger diinisialisasi dengan level: ${logger.level}`);
if (isDevelopment) {
    logger.debug('Pretty printing diaktifkan untuk development.');
}

module.exports = logger;
