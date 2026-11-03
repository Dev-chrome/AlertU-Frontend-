'use strict';

const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../util/AppError');

const createMapsService = ({
  apiKey = env.GOOGLE_MAPS_SERVER_API_KEY,
  fetchImpl = global.fetch,
  timeoutMs = 8000,
} = {}) => {
  const isConfigured = () => Boolean(apiKey);

  const request = async (url) => {
    if (!apiKey) {
      throw AppError.serviceUnavailable(
        'Google Maps geocoding is not configured on this server',
        'MAPS_NOT_CONFIGURED'
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Maps provider returned HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logger.warn({ message: error.message }, 'maps provider request failed');
      throw AppError.serviceUnavailable(
        'Google Maps is temporarily unavailable',
        'MAPS_UNAVAILABLE'
      );
    } finally {
      clearTimeout(timeout);
    }
  };

  const mapResult = (result) => ({
    formattedAddress: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    placeId: result.place_id,
    locationType: result.geometry.location_type,
    types: result.types || [],
  });

  const geocodeAddress = async (address) => {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', apiKey || '');
    url.searchParams.set('region', 'ng');

    const data = await request(url.toString());

    if (data.status === 'ZERO_RESULTS') {
      throw AppError.unprocessable('No location matched that address', undefined, 'MAPS_NO_RESULTS');
    }
    if (data.status !== 'OK') {
      throw AppError.serviceUnavailable(
        'Google Maps could not resolve the address',
        'MAPS_BAD_RESPONSE'
      );
    }

    return (data.results || []).slice(0, 5).map(mapResult);
  };

  const reverseGeocode = async (latitude, longitude) => {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${latitude},${longitude}`);
    url.searchParams.set('key', apiKey || '');

    const data = await request(url.toString());

    if (data.status === 'ZERO_RESULTS') {
      throw AppError.unprocessable(
        'No address matched those coordinates',
        undefined,
        'MAPS_NO_RESULTS'
      );
    }
    if (data.status !== 'OK') {
      throw AppError.serviceUnavailable(
        'Google Maps could not resolve the coordinates',
        'MAPS_BAD_RESPONSE'
      );
    }

    return (data.results || []).slice(0, 3).map(mapResult);
  };

  return {
    isConfigured,
    geocodeAddress,
    reverseGeocode,
  };
};

module.exports = {
  createMapsService,
  mapsService: createMapsService(),
};
