/**
 * Kelas dasar untuk semua error API yang terstandarisasi.
 * Setiap error API memiliki statusCode HTTP dan errorCode internal yang unik.
 */
export class ApiError extends Error {
	public readonly statusCode: number;
	public readonly errorCode: string;

	constructor(statusCode: number, errorCode: string, message: string) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		Object.setPrototypeOf(this, new.target.prototype); // Memulihkan rantai prototipe
	}
}

/**
 * Error untuk request yang tidak valid atau salah format (HTTP 400).
 * @example
 * if (!email) {
 *   throw new BadRequestError('EMAIL_REQUIRED', 'Alamat email wajib diisi.');
 * }
 */
export class BadRequestError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(400, errorCode, message);
	}
}

/**
 * Error untuk akses yang memerlukan autentikasi (HTTP 401).
 * @example
 * if (!session) {
 *   throw new UnauthorizedError('AUTH_REQUIRED', 'Sesi tidak valid atau telah berakhir.');
 * }
 */
export class UnauthorizedError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(401, errorCode, message);
	}
}

/**
 * Error untuk akses yang ditolak karena hak akses tidak cukup (HTTP 403).
 * @example
 * if (user.role !== 'admin') {
 *   throw new ForbiddenError('ADMIN_ONLY', 'Akses ditolak. Hanya untuk administrator.');
 * }
 */
export class ForbiddenError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(403, errorCode, message);
	}
}

/**
 * Error ketika sumber daya yang diminta tidak ditemukan (HTTP 404).
 * @example
 * const user = await db.findUser(id);
 * if (!user) {
 *   throw new NotFoundError('USER_NOT_FOUND', `Pengguna dengan ID ${id} tidak ditemukan.`);
 * }
 */
export class NotFoundError extends ApiError {
	constructor(errorCode: string, message: string) {
		super(404, errorCode, message);
	}
}

/**
 * Error untuk kegagalan internal server yang tidak terduga (HTTP 500).
 * Sebaiknya digunakan untuk error yang tidak dapat dipulihkan oleh klien.
 */
export class InternalServerError extends ApiError {
	constructor(message: string = 'Terjadi kesalahan internal pada server.') {
		super(500, 'INTERNAL_SERVER_ERROR', message);
	}
}