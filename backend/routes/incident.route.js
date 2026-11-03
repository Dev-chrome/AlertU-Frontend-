'use strict';

const express = require('express');
const validate = require('../middleware/validate.middleware');
const { writeLimiter } = require('../middleware/rateLimit.middleware');
const {
  addIncidentUpdateSchema,
  incidentParams,
  listIncidentsQuery,
} = require('../validator/incident.validator');
const controller = require('../controller/incident.controller');

const createIncidentRouter = ({ authenticate, optionalAuth }) => {
  const router = express.Router();

  router.get('/', optionalAuth, validate({ query: listIncidentsQuery }), controller.listIncidents);
  router.get('/:id', optionalAuth, validate({ params: incidentParams }), controller.getIncident);
  router.post(
    '/:id/updates',
    authenticate,
    writeLimiter,
    validate({ params: incidentParams, body: addIncidentUpdateSchema }),
    controller.addIncidentUpdate
  );

  return router;
};

module.exports = createIncidentRouter;
