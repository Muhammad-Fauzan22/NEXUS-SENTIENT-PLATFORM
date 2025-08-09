// src/lib/server/utils/logger.js
// Fungsi logging terstruktur untuk sisi server NEXUS-SENTIENT-PLATFORM.
// Menggunakan Winston untuk logging yang robust dan dapat dikonfigurasi.

import winston from 'winston';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

/**
 * Mendefinisikan format log kustom untuk konsistensi.
 * @param {import('winston').Logform.TransformableInfo} info - Objek log dari Winston.
 * @returns {string} String log yang sudah diformat.
 */
const logFormat = printf(({ level, message, timestamp, stack }) => {
	// Jika ada stack trace dari error, sertakan dalam log untuk debugging yang lebih mudah.
	if (stack) {
		return `[${timestamp}] ${level}: ${message}\n${stack}`;
	}
	return `[${timestamp}] ${level}: ${message}`;
});

// Buat instance logger utama yang akan digunakan di seluruh aplikasi.
const logger = createLogger({
	// Level logging minimum. Di produksi, kita hanya ingin melihat 'info' ke atas.
	// Di development, kita ingin melihat semuanya ('debug').
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		errors({ stack: true }), // Ini akan secara otomatis menangkap stack trace dari objek Error
		logFormat
	),
	transports: [
		// Selalu log ke konsol.
		new transports.Console({
			format: combine(
				colorize(), // Beri warna pada output log di konsol untuk keterbacaan
				logFormat
			)
		})
		// Di lingkungan produksi, Anda bisa menambahkan transport lain di sini,
		// misalnya untuk mengirim log ke file atau layanan logging cloud.
		// new transports.File({ filename: 'error.log', level: 'error' }),
		// new transports.File({ filename: 'combined.log' }),
	]
});

/**
 * Ekspor logger yang sudah dikonfigurasi agar bisa digunakan di seluruh backend.
 *
 * @example
 * import { logger } from '$lib/server/utils/logger';
 * logger.info('Pesan informasi');
 * logger.warn('Peringatan, ada potensi masalah.');
 * logger.error('Terjadi kesalahan fatal.', new Error('Detail error untuk stack trace'));
 */
export { logger };