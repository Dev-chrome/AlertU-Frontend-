'use strict';

const { z } = require('zod');
const { DEVICE_PLATFORMS } = require('../constants/device');

const token = z.string().min(20).max(4096);
const platform = z.enum(DEVICE_PLATFORMS);

const registerDeviceSchema = z.object({
  token,
  platform,
  appVersion: z.string().max(32).optional().nullable(),
});

const deactivateDeviceSchema = z.object({
  token,
});

module.exports = {
  registerDeviceSchema,
  deactivateDeviceSchema,
};
