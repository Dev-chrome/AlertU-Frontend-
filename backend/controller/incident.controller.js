'use strict';

const asyncHandler = require('../util/asyncHandler');
const { paginationMeta } = require('../util/pagination');
const incidentService = require('../service/incident.service');

const listIncidents = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const { incidents, total } = await incidentService.listIncidents({
    query: req.validated.query,
    viewer: req.user,
  });

  res.status(200).json({
    data: incidents,
    meta: paginationMeta({ page, limit, total }),
  });
});

const getIncident = asyncHandler(async (req, res) => {
  const incident = await incidentService.getIncident({
    incidentId: req.validated.params.id,
    viewer: req.user,
  });
  res.status(200).json({ data: incident });
});

const addIncidentUpdate = asyncHandler(async (req, res) => {
  const result = await incidentService.addIncidentUpdate({
    incidentId: req.validated.params.id,
    user: req.user,
    payload: req.validated.body,
  });
  res.status(201).json({ data: result });
});

module.exports = {
  listIncidents,
  getIncident,
  addIncidentUpdate,
};
