'use strict';

const asyncHandler = require('../util/asyncHandler');
const { mapsService } = require('../service/maps.service');

const geocode = asyncHandler(async (req, res) => {
  const results = await mapsService.geocodeAddress(req.validated.body.address);
  res.status(200).json({ data: { results } });
});

const reverseGeocode = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.validated.body;
  const results = await mapsService.reverseGeocode(latitude, longitude);
  res.status(200).json({ data: { results } });
});

const status = asyncHandler(async (req, res) => {
  res.status(200).json({ data: { configured: mapsService.isConfigured() } });
});

module.exports = {
  geocode,
  reverseGeocode,
  status,
};
