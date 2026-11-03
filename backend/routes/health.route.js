'use strict';

const express = require('express');
const { healthCheck, liveness } = require('../controller/health.controller');

const createHealthRouter = () => {
  const router = express.Router();
  router.get('/', healthCheck);
  router.get('/live', liveness);
  return router;
};

module.exports = createHealthRouter;
