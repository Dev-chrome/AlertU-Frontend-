'use strict';

const { sequelize } = require('../models');

const healthCheck = async (req, res) => {
  const startedAt = Date.now();

  try {
    // authenticate() already performs a SELECT 1 on a pooled connection.
    await sequelize.authenticate();
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database: {
        status: 'up',
        latencyMs: Date.now() - startedAt,
      },
    });
  } catch (error) {
    return res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database: { status: 'down' },
    });
  }
};

const liveness = (req, res) =>
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });

module.exports = {
  healthCheck,
  liveness,
};
