'use strict';

const asyncHandler = require('../util/asyncHandler');
const { paginationMeta } = require('../util/pagination');
const moderationService = require('../service/moderation.service');

const queue = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const { incidents, total } = await moderationService.getQueue({
    query: req.validated.query,
  });

  res.status(200).json({
    data: incidents,
    meta: paginationMeta({ page, limit, total }),
  });
});

const reports = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const { reports: items, total } = await moderationService.listReports({
    query: req.validated.query,
  });

  res.status(200).json({
    data: items,
    meta: paginationMeta({ page, limit, total }),
  });
});

const decide = asyncHandler(async (req, res) => {
  const result = await moderationService.recordDecision({
    incidentId: req.validated.params.id,
    actor: req.user,
    payload: req.validated.body,
  });
  res.status(200).json({ data: result });
});

const merge = asyncHandler(async (req, res) => {
  const result = await moderationService.mergeIncidents({
    targetIncidentId: req.validated.params.id,
    actor: req.user,
    payload: req.validated.body,
  });
  res.status(200).json({ data: result });
});

const split = asyncHandler(async (req, res) => {
  const result = await moderationService.splitIncident({
    incidentId: req.validated.params.id,
    actor: req.user,
    payload: req.validated.body,
  });
  res.status(201).json({ data: result });
});

module.exports = {
  queue,
  reports,
  decide,
  merge,
  split,
};
