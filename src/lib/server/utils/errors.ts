export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', errorCode?: string) {
    super(400, message, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', errorCode?: string) {
    super(404, message, errorCode);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', errorCode?: string) {
    super(500, message, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', errorCode?: string) {
    super(401, message, errorCode);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error', errorCode?: string) {
    super(422, message, errorCode);
  }
}
