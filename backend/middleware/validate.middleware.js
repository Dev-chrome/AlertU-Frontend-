'use strict';

const { ZodError } = require('zod');
const AppError = require('../util/AppError');

const validate = (schemas) => (req, res, next) => {
  try {
    const validated = {};

    if (schemas.body) {
      validated.body = schemas.body.parse(req.body);
      req.body = validated.body;
    }
    if (schemas.query) {
      validated.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      validated.params = schemas.params.parse(req.params);
    }

    req.validated = validated;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(
        AppError.badRequest(
          'Request validation failed',
          error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
          'VALIDATION_ERROR'
        )
      );
    }
    return next(error);
  }
};

module.exports = validate;
