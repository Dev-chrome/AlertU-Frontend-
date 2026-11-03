'use strict';

const { UniqueConstraintError } = require('sequelize');
const { DeviceToken } = require('../models');

const registerDevice = async ({ user, payload }) => {
  let device = await DeviceToken.findOne({ where: { token: payload.token } });
  let created = false;

  if (!device) {
    try {
      device = await DeviceToken.create({
        userId: user.id,
        token: payload.token,
        platform: payload.platform,
        appVersion: payload.appVersion || null,
        active: true,
        lastSeenAt: new Date(),
      });
      created = true;
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) throw error;
      device = await DeviceToken.findOne({ where: { token: payload.token } });
      if (!device) throw error;
    }
  }

  if (device.userId !== user.id || !device.active) {
    // A push token can move between accounts on the same device. The token is
    // only known to the authenticated app instance, and ownership is updated
    // explicitly rather than silently leaving notifications on the old user.
    await device.update({
      userId: user.id,
      platform: payload.platform,
      appVersion: payload.appVersion || device.appVersion,
      active: true,
      lastSeenAt: new Date(),
    });
  } else {
    await device.update({
      platform: payload.platform,
      appVersion: payload.appVersion || device.appVersion,
      lastSeenAt: new Date(),
    });
  }

  return {
    device: {
      id: device.id,
      platform: device.platform,
      active: device.active,
      appVersion: device.appVersion,
      lastSeenAt: device.lastSeenAt,
    },
    created,
  };
};

const deactivateDevice = async ({ user, token }) => {
  const device = await DeviceToken.findOne({ where: { token, userId: user.id } });
  if (!device) return false;

  if (device.active) await device.update({ active: false });
  return true;
};

module.exports = {
  registerDevice,
  deactivateDevice,
};
