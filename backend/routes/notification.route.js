'use strict';

const express = require('express');
const validate = require('../middleware/validate.middleware');
const { updatePreferencesSchema } = require('../validator/notification.validator');
const controller = require('../controller/notification.controller');

const createNotificationRouter = ({ authenticate }) => {
  const router = express.Router();

  router.get('/', authenticate, controller.getPreferences);
  router.put(
    '/',
    authenticate,
    validate({ body: updatePreferencesSchema }),
    controller.updatePreferences
  );

  return router;
};

module.exports = createNotificationRouter;
