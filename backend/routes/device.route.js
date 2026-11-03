'use strict';

const express = require('express');
const validate = require('../middleware/validate.middleware');
const { writeLimiter } = require('../middleware/rateLimit.middleware');
const {
  deactivateDeviceSchema,
  registerDeviceSchema,
} = require('../validator/device.validator');
const controller = require('../controller/device.controller');

const createDeviceRouter = ({ authenticate }) => {
  const router = express.Router();

  router.get('/', authenticate, controller.listMine);
  router.post(
    '/push-token',
    authenticate,
    writeLimiter,
    validate({ body: registerDeviceSchema }),
    controller.register
  );
  router.delete(
    '/push-token',
    authenticate,
    writeLimiter,
    validate({ body: deactivateDeviceSchema }),
    controller.deactivate
  );

  return router;
};

module.exports = createDeviceRouter;
