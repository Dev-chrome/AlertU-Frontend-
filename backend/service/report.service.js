'use strict';

const { Op } = require('sequelize');
const {
  Campus,
  Incident,
  IncidentReport,
  Report,
  User,
  sequelize,
} = require('../models');
const env = require('../config/env');
const AppError = require('../util/AppError');
const { isModerator } = require('../constants/roles');
const {
  CATEGORY_LABELS,
  INCIDENT_STATUSES,
  getIncidentTtlHours,
} = require('../constants/incident');
const { mapsService } = require('./maps.service');
const { reportBase } = require('../util/serializers');

const resolveCampus = async ({ user, campusId }) => {
  if (campusId && user.role === 'student' && user.campusId && user.campusId !== campusId) {
    throw AppError.forbidden(
      'Students may only submit reports for their own campus',
      'CAMPUS_SCOPE_FORBIDDEN'
    );
  }

  const resolvedId = campusId || user.campusId;
  if (!resolvedId) {
    throw AppError.badRequest(
      'campusId is required because this account is not assigned to a campus',
      undefined,
      'CAMPUS_REQUIRED'
    );
  }

  const campus = await Campus.findOne({ where: { id: resolvedId, isActive: true } });
  if (!campus) throw AppError.badRequest('Campus not found or inactive', undefined, 'CAMPUS_INVALID');
  return campus;
};

const resolveLocation = async (payload) => {
  if (payload.latitude !== undefined && payload.longitude !== undefined) {
    return {
      latitude: payload.latitude,
      longitude: payload.longitude,
      locationName: payload.locationName,
    };
  }

  const results = await mapsService.geocodeAddress(payload.address);
  if (!results || results.length === 0) {
    throw AppError.unprocessable('No location matched that address', undefined, 'MAPS_NO_RESULTS');
  }

  return {
    latitude: results[0].latitude,
    longitude: results[0].longitude,
    locationName: payload.locationName || results[0].formattedAddress,
  };
};

const createTitle = (category, locationName) => {
  const label = CATEGORY_LABELS[category] || 'Incident';
  return `${label} reported near ${locationName}`.slice(0, 160);
};

const createReport = async ({ user, payload }) => {
  const campus = await resolveCampus({ user, campusId: payload.campusId });
  const location = await resolveLocation(payload);
  const observedAt = payload.observedAt || new Date();
  const ttlHours = getIncidentTtlHours(payload.category, env.INCIDENT_DEFAULT_TTL_HOURS);
  const expiresAt = new Date(observedAt.getTime() + ttlHours * 60 * 60 * 1000);
  const categoryLabel = CATEGORY_LABELS[payload.category] || 'Incident';

  const result = await sequelize.transaction(async (transaction) => {
    const report = await Report.create(
      {
        reporterUserId: user.id,
        campusId: campus.id,
        category: payload.category,
        description: payload.description,
        observedAt,
        submittedAt: new Date(),
        locationName: location.locationName,
        latitude: location.latitude,
        longitude: location.longitude,
        mediaRefs: payload.mediaRefs || [],
        isAnonymous: payload.isAnonymous,
      },
      { transaction }
    );

    const incident = await Incident.create(
      {
        campusId: campus.id,
        createdByUserId: user.id,
        title: createTitle(payload.category, location.locationName),
        category: payload.category,
        status: INCIDENT_STATUSES.REPORTED,
        publicSummary: `A ${categoryLabel.toLowerCase()} report was submitted near ${location.locationName}. Not independently verified.`,
        firstSeenAt: observedAt,
        lastSeenAt: observedAt,
        expiresAt,
        locationName: location.locationName,
        latitude: location.latitude,
        longitude: location.longitude,
        reportCount: 1,
      },
      { transaction }
    );

    await IncidentReport.create(
      {
        incidentId: incident.id,
        reportId: report.id,
        linkedByUserId: user.id,
        linkSource: 'initial_report',
        rationale: 'Initial report created the incident record.',
        active: true,
        linkedAt: new Date(),
      },
      { transaction }
    );

    return { report, incident };
  });

  const hydrated = await Report.findByPk(result.report.id, {
    include: [{ model: Campus, as: 'campus' }],
  });

  return {
    report: reportBase(hydrated, { viewer: user }),
    incidentId: result.incident.id,
  };
};

const getReport = async ({ reportId, user }) => {
  const report = await Report.findByPk(reportId, {
    include: [
      { model: User, as: 'reporter', attributes: ['id', 'displayName', 'email', 'role'] },
      { model: Campus, as: 'campus' },
      {
        model: IncidentReport,
        as: 'incidentLinks',
        where: { active: true },
        required: false,
        include: [{ model: Incident, as: 'incident', attributes: ['id', 'title', 'status'] }],
      },
    ],
  });

  if (!report) throw AppError.notFound('Report not found', 'REPORT_NOT_FOUND');

  const owner = report.reporterUserId === user.id;
  if (!owner && !isModerator(user)) {
    throw AppError.forbidden('You may only view your own report', 'REPORT_FORBIDDEN');
  }

  return {
    ...reportBase(report, { viewer: user }),
    incidents: (report.incidentLinks || []).map((link) => ({
      id: link.incident?.id,
      title: link.incident?.title,
      status: link.incident?.status,
      linkedAt: link.linkedAt,
    })),
  };
};

const listMyReports = async ({ user, page, limit }) => {
  const { rows, count } = await Report.findAndCountAll({
    where: { reporterUserId: user.id },
    order: [['submittedAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    include: [{ model: Campus, as: 'campus' }],
  });

  return {
    reports: rows.map((report) => reportBase(report, { viewer: user })),
    total: count,
  };
};

const searchReportsForModeration = async ({ campusId, q, page, limit }) => {
  const where = {};
  if (campusId) where.campusId = campusId;
  if (q) {
    where[Op.or] = [
      { description: { [Op.iLike]: `%${q}%` } },
      { locationName: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { rows, count } = await Report.findAndCountAll({
    where,
    order: [['submittedAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    include: [
      { model: User, as: 'reporter', attributes: ['id', 'displayName', 'email', 'role'] },
      { model: Campus, as: 'campus' },
    ],
  });

  return {
    reports: rows.map((report) => reportBase(report, { viewer: { role: 'moderator' } })),
    total: count,
  };
};

module.exports = {
  createReport,
  getReport,
  listMyReports,
  searchReportsForModeration,
};
