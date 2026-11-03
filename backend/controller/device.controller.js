'use strict';

const asyncHandler = require('../util/asyncHandler');
const { paginationMeta } = require('../util/pagination');
const { DeviceToken } = require('../models');
const deviceService = require('../service/device.service');

const register = asyncHandler(async (req, res) => {
  const result = await deviceService.registerDevice({
    user: req.user,
    payload: req.validated.body,
  });
  res.status(result.created ? 201 : 200).json({ data: result.device });
});

const deactivate = asyncHandler(async (req, res) => {
  await deviceService.deactivateDevice({
    user: req.user,
    token: req.validated.body.token,
  });
  res.status(204).send();
});

const listMine = asyncHandler(async (req, res) => {
  const devices = await DeviceToken.findAll({
    where: { userId: req.user.id, active: true },
    attributes: ['id', 'platform', 'appVersion', 'active', 'lastSeenAt'],
    order: [['lastSeenAt', 'DESC']],
  });
  res.status(200).json({
    data: devices,
    meta: paginationMeta({ page: 1, limit: 50, total: devices.length }),
  });
});

module.exports = {
  register,
  deactivate,
  listMine,
};
