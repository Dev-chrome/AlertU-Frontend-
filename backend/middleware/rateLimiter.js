"use strict";

const rateLimit = require("express-rate-limit");

const rateLimitHandler = (message) => (req, res) => {
  return res.status(429).json({
    success: false,
    message,
  });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  handler: rateLimitHandler(
    "Too many authentication attempts. Please try again later."
  ),
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  handler: rateLimitHandler("Too many requests. Please try again later."),
});

module.exports = {
  authLimiter,
  apiLimiter,
};
