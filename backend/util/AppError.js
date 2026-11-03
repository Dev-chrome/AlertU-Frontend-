'use strict';

class AppError extends Error {
  constructor(statusCode, message, code = 'APP_ERROR', details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message, details, code = 'BAD_REQUEST') {
    return new AppError(400, message, code, details);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new AppError(401, message, code);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(403, message, code);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new AppError(404, message, code);
  }

  static conflict(message = 'Conflict', code = 'CONFLICT') {
    return new AppError(409, message, code);
  }

  static unprocessable(message = 'Unprocessable request', details, code = 'UNPROCESSABLE') {
    return new AppError(422, message, code, details);
  }

  static serviceUnavailable(message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE') {
    return new AppError(503, message, code);
  }
}

module.exports = AppError;
