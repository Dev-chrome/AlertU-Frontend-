'use strict';

const { ZodError } = require('zod');
const {
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ValidationError,
  DatabaseError,
} = require('sequelize');
const logger = require('../config/logger');
const AppError = require('../util/AppError');

const notFound = (req, res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} was not found`, 'ROUTE_NOT_FOUND'));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  } else if (error instanceof UniqueConstraintError) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A record with the same unique value already exists';
    details = error.errors?.map((item) => ({ path: item.path, message: item.message }));
  } else if (error instanceof ForeignKeyConstraintError) {
    statusCode = 409;
    code = 'FOREIGN_KEY_CONFLICT';
    message = 'The request references a record that does not exist or is still in use';
  } else if (error instanceof ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation failed';
    details = error.errors?.map((item) => ({ path: item.path, message: item.message }));
  } else if (error instanceof DatabaseError) {
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = 'A database error occurred';
  } else if (error.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Request body must contain valid JSON';
  } else if (error.type === 'entity.too.large') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large';
  }

  if (statusCode >= 500) {
    logger.error(
      {
        err: error,
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
      },
      'request failed'
    );
  } else {
    logger.warn(
      { code, requestId: req.id, method: req.method, path: req.originalUrl },
      'request rejected'
    );
  }

  const response = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    requestId: req.id,
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
