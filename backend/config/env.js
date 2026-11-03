'use strict';

require('dotenv').config();

const bool = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const int = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: int(process.env.PORT, 5000),
  TRUST_PROXY: process.env.TRUST_PROXY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT || '1mb',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  JWT_SECRET: process.env.JWT_SECRET || '',

  // Development-only bearer-token auth. Never enabled in production.
  DEV_AUTH_ENABLED: bool(process.env.DEV_AUTH_ENABLED, false),
  DEV_AUTH_TOKEN: process.env.DEV_AUTH_TOKEN || '',
  DEV_AUTH_UID: process.env.DEV_AUTH_UID || 'dev-local-user',
  DEV_AUTH_NAME: process.env.DEV_AUTH_NAME || 'AlertU Dev User',
  DEV_AUTH_EMAIL: process.env.DEV_AUTH_EMAIL || 'dev@alertu.local',
  DEV_AUTH_CAMPUS_ID: process.env.DEV_AUTH_CAMPUS_ID || '',

  DB_URL: process.env.DB_URL || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_USER: process.env.DB_USER || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || '',
  DB_HOST: process.env.DB_HOST || '',
  DB_PORT: process.env.DB_PORT || '',
  DB_SSL: bool(process.env.DB_SSL, true),
  DB_SSL_REJECT_UNAUTHORIZED: bool(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
  DB_SSL_CA_BASE64: process.env.DB_SSL_CA_BASE64 || '',
  DB_LOGGING: bool(process.env.DB_LOGGING, false),
  DB_POOL_MAX: int(process.env.DB_POOL_MAX, 10),
  DB_POOL_MIN: int(process.env.DB_POOL_MIN, 0),

  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST || '',

  PUSH_ENABLED: bool(process.env.PUSH_ENABLED, true),
  PUSH_PROVIDER: (process.env.PUSH_PROVIDER || 'fcm').toLowerCase(),
  EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN || '',
  NOTIFICATION_MAX_ATTEMPTS: int(process.env.NOTIFICATION_MAX_ATTEMPTS, 5),

  GOOGLE_MAPS_SERVER_API_KEY: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
  INCIDENT_DEFAULT_TTL_HOURS: int(process.env.INCIDENT_DEFAULT_TTL_HOURS, 24),

  RATE_LIMIT_WINDOW_MS: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  RATE_LIMIT_MAX: int(process.env.RATE_LIMIT_MAX, 300),
  WRITE_RATE_LIMIT_MAX: int(process.env.WRITE_RATE_LIMIT_MAX, 60),
  MODERATION_RATE_LIMIT_MAX: int(process.env.MODERATION_RATE_LIMIT_MAX, 30),
  MAPS_RATE_LIMIT_MAX: int(process.env.MAPS_RATE_LIMIT_MAX, 30),
};
