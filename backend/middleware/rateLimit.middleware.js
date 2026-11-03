'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const limiter = ({ windowMs = env.RATE_LIMIT_WINDOW_MS, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message,
        },
        requestId: req.id,
      });
    },
  });

const globalLimiter = limiter({
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests. Please try again later.',
});

const writeLimiter = limiter({
  max: env.WRITE_RATE_LIMIT_MAX,
  message: 'Too many write requests. Please slow down.',
});

const moderationLimiter = limiter({
  max: env.MODERATION_RATE_LIMIT_MAX,
  message: 'Too many moderation requests. Please slow down.',
});

const mapsLimiter = limiter({
  max: env.MAPS_RATE_LIMIT_MAX,
  message: 'Too many map requests. Please try again later.',
});

module.exports = {
  globalLimiter,
  writeLimiter,
  moderationLimiter,
  mapsLimiter,
};
