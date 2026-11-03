'use strict';

const express = require('express');
const validate = require('../middleware/validate.middleware');
const { writeLimiter } = require('../middleware/rateLimit.middleware');
const { createReportSchema } = require('../validator/report.validator');
const { paginationQuery, uuidParams } = require('../validator/common.validator');
const controller = require('../controller/report.controller');

const createReportRouter = ({ authenticate }) => {
  const router = express.Router();

  router.post('/', authenticate, writeLimiter, validate({ body: createReportSchema }), controller.createReport);
  router.get('/', authenticate, validate({ query: paginationQuery }), controller.listMyReports);
  router.get('/:id', authenticate, validate({ params: uuidParams('id') }), controller.getReport);

  return router;
};

module.exports = createReportRouter;
