'use strict';

const express = require('express');
const validate = require('../middleware/validate.middleware');
const { mapsLimiter } = require('../middleware/rateLimit.middleware');
const {
  geocodeSchema,
  reverseGeocodeSchema,
} = require('../validator/map.validator');
const controller = require('../controller/map.controller');

const createMapRouter = ({ authenticate }) => {
  const router = express.Router();

  router.use(authenticate, mapsLimiter);
  router.get('/status', controller.status);
  router.post('/geocode', validate({ body: geocodeSchema }), controller.geocode);
  router.post('/reverse-geocode', validate({ body: reverseGeocodeSchema }), controller.reverseGeocode);

  return router;
};

module.exports = createMapRouter;
