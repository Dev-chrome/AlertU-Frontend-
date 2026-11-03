'use strict';

const { Op } = require('sequelize');
const {
  Campus,
  Incident,
  IncidentReport,
  Report,
  sequelize,
} = require('../models');
const env = require('../config/env');
const AppError = require('../util/AppError');
const {
  MODERATION_ACTIONS,
  canTransition,
  getIncidentTtlHours,
  isActiveStatus,
} = require('../constants/incident');
const { incidentBase, moderationAction } = require('../util/serializers');
const { recordModerationAction } = require('./audit.service');
const {
  queueIncidentStatusEvents,
  dispatchEventIds,
} = require('./notification.service');
const { getModerationQueue } = require('./incident.service');
const { searchReportsForModeration } = require('./report.service');

const hydrateIncident = (incidentId, transaction) =>
  Incident.findByPk(incidentId, {
    include: [{ model: Campus, as: 'campus' }],
    transaction,
  });

const recordDecision = async ({ incidentId, actor, payload }) => {
  const result = await sequelize.transaction(async (transaction) => {
    const incident = await Incident.findByPk(incidentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!incident) throw AppError.notFound('Incident not found', 'INCIDENT_NOT_FOUND');
    if (incident.status === payload.status) {
      throw AppError.conflict('Incident already has that status', 'STATUS_UNCHANGED');
    }
    if (!canTransition(incident.status, payload.status)) {
      throw AppError.conflict(
        `Status transition ${incident.status} -> ${payload.status} is not allowed`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    if (payload.status === 'verified') {
      const activeReports = await IncidentReport.count({
        where: { incidentId: incident.id, active: true },
        transaction,
      });
      if (activeReports < 1) {
        throw AppError.conflict(
          'An incident needs at least one active source report before verification',
          'VERIFICATION_REQUIRES_REPORT'
        );
      }
    }

    const beforeStatus = incident.status;
    const updates = { status: payload.status };
    if (payload.publicSummary !== undefined) updates.publicSummary = payload.publicSummary;
    if (payload.expiresAt !== undefined) updates.expiresAt = payload.expiresAt;

    await incident.update(updates, { transaction });

    const action = await recordModerationAction({
      actorUserId: actor.id,
      incidentId: incident.id,
      action: MODERATION_ACTIONS.DECISION,
      reasonCode: payload.reasonCode,
      evidenceNote: payload.evidenceNote || null,
      beforeStatus,
      afterStatus: payload.status,
      metadata: {
        publicSummaryProvided: payload.publicSummary !== undefined,
        expiresAtProvided: payload.expiresAt !== undefined,
      },
      transaction,
    });

    const events = await queueIncidentStatusEvents({ incident, action, transaction });
    const hydrated = await hydrateIncident(incident.id, transaction);

    return { incident: hydrated, action, events };
  });

  dispatchEventIds(result.events.map((event) => event.id));

  return {
    incident: incidentBase(result.incident, { viewer: actor }),
    action: moderationAction(result.action, { moderator: true }),
  };
};

const mergeIncidents = async ({ targetIncidentId, actor, payload }) => {
  const result = await sequelize.transaction(async (transaction) => {
    const target = await Incident.findByPk(targetIncidentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!target) throw AppError.notFound('Target incident not found', 'INCIDENT_NOT_FOUND');
    if (!isActiveStatus(target.status)) {
      throw AppError.conflict(
        'The target incident is not open for merging',
        'TARGET_NOT_MERGEABLE'
      );
    }

    const sourceIds = payload.sourceIncidentIds.filter((id) => id !== targetIncidentId);
    if (sourceIds.length === 0) {
      throw AppError.badRequest('At least one source incident is required', undefined, 'MERGE_NO_SOURCES');
    }
    if (sourceIds.length !== payload.sourceIncidentIds.length) {
      throw AppError.badRequest('The target cannot also be a source', undefined, 'MERGE_SELF');
    }

    const sources = await Incident.findAll({
      where: { id: { [Op.in]: sourceIds } },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (sources.length !== sourceIds.length) {
      throw AppError.notFound('One or more source incidents were not found', 'INCIDENT_NOT_FOUND');
    }
    if (sources.some((source) => source.campusId !== target.campusId)) {
      throw AppError.badRequest(
        'All incidents in a merge must belong to the same campus',
        undefined,
        'MERGE_CAMPUS_MISMATCH'
      );
    }
    if (sources.some((source) => !isActiveStatus(source.status))) {
      throw AppError.conflict(
        'One or more source incidents are not open for merging',
        'SOURCE_NOT_MERGEABLE'
      );
    }

    const sourceLinks = await IncidentReport.findAll({
      where: { incidentId: { [Op.in]: sourceIds }, active: true },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const reportIds = [...new Set(sourceLinks.map((link) => link.reportId))];
    if (reportIds.length === 0) {
      throw AppError.conflict('The source incidents have no active reports', 'MERGE_NO_REPORTS');
    }

    const activeLinks = await IncidentReport.findAll({
      where: { reportId: { [Op.in]: reportIds }, active: true },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const outside = activeLinks.filter(
      (link) => link.incidentId !== targetIncidentId && !sourceIds.includes(link.incidentId)
    );
    if (outside.length > 0) {
      throw AppError.conflict(
        'A report is already active in a different incident',
        'REPORT_ALREADY_LINKED'
      );
    }

    const now = new Date();
    if (sourceLinks.length > 0) {
      await IncidentReport.update(
        { active: false, unlinkedAt: now },
        { where: { id: { [Op.in]: sourceLinks.map((link) => link.id) } }, transaction }
      );
    }

    const targetLinks = await IncidentReport.findAll({
      where: { incidentId: targetIncidentId, reportId: { [Op.in]: reportIds } },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const targetLinkByReport = new Map(targetLinks.map((link) => [link.reportId, link]));
    const activeTargetReports = new Set(
      activeLinks
        .filter((link) => link.incidentId === targetIncidentId)
        .map((link) => link.reportId)
    );

    for (const reportId of reportIds) {
      if (activeTargetReports.has(reportId)) continue;
      const existing = targetLinkByReport.get(reportId);
      if (existing) {
        await existing.update(
          {
            active: true,
            unlinkedAt: null,
            linkedAt: now,
            linkSource: 'moderator_merge',
            linkedByUserId: actor.id,
            rationale: payload.rationale,
          },
          { transaction }
        );
      } else {
        await IncidentReport.create(
          {
            incidentId: targetIncidentId,
            reportId,
            linkedByUserId: actor.id,
            linkSource: 'moderator_merge',
            rationale: payload.rationale,
            active: true,
            linkedAt: now,
          },
          { transaction }
        );
      }
    }

    const finalLinks = await IncidentReport.findAll({
      where: { incidentId: targetIncidentId, active: true },
      transaction,
    });
    const finalReportIds = finalLinks.map((link) => link.reportId);
    const reports = await Report.findAll({
      where: { id: { [Op.in]: finalReportIds } },
      attributes: ['id', 'observedAt'],
      transaction,
    });
    const observedTimes = reports.map((report) => new Date(report.observedAt).getTime());
    const firstSeenAt = new Date(Math.min(...observedTimes));
    const lastSeenAt = new Date(
      Math.max(...observedTimes, new Date(target.lastSeenAt).getTime())
    );
    const ttlHours = getIncidentTtlHours(target.category, env.INCIDENT_DEFAULT_TTL_HOURS);

    await target.update(
      {
        reportCount: finalReportIds.length,
        firstSeenAt,
        lastSeenAt,
        expiresAt: new Date(lastSeenAt.getTime() + ttlHours * 60 * 60 * 1000),
        ...(payload.title ? { title: payload.title } : {}),
        ...(payload.publicSummary ? { publicSummary: payload.publicSummary } : {}),
      },
      { transaction }
    );

    for (const source of sources) {
      const beforeStatus = source.status;
      const remaining = await IncidentReport.count({
        where: { incidentId: source.id, active: true },
        transaction,
      });
      await source.update(
        {
          status: 'rejected',
          reportCount: remaining,
          publicSummary: `This incident was merged into another incident after moderator review.`,
        },
        { transaction }
      );

      await recordModerationAction({
        actorUserId: actor.id,
        incidentId: source.id,
        action: MODERATION_ACTIONS.MERGE_SOURCE,
        reasonCode: payload.reasonCode,
        evidenceNote: payload.rationale,
        beforeStatus,
        afterStatus: 'rejected',
        metadata: { mergedIntoIncidentId: targetIncidentId },
        transaction,
      });
    }

    await recordModerationAction({
      actorUserId: actor.id,
      incidentId: targetIncidentId,
      action: MODERATION_ACTIONS.MERGE_TARGET,
      reasonCode: payload.reasonCode,
      evidenceNote: payload.rationale,
      beforeStatus: target.status,
      afterStatus: target.status,
      metadata: {
        sourceIncidentIds: sourceIds,
        mergedReportCount: reportIds.length,
        reportCount: finalReportIds.length,
      },
      transaction,
    });

    const hydrated = await hydrateIncident(targetIncidentId, transaction);
    return { incident: hydrated, sourceIncidentIds: sourceIds, mergedReportCount: reportIds.length };
  });

  return {
    incident: incidentBase(result.incident, { viewer: actor }),
    sourceIncidentIds: result.sourceIncidentIds,
    mergedReportCount: result.mergedReportCount,
  };
};

const splitIncident = async ({ incidentId, actor, payload }) => {
  const result = await sequelize.transaction(async (transaction) => {
    const source = await Incident.findByPk(incidentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!source) throw AppError.notFound('Incident not found', 'INCIDENT_NOT_FOUND');
    if (!isActiveStatus(source.status)) {
      throw AppError.conflict('This incident is not open for splitting', 'INCIDENT_NOT_SPLITTABLE');
    }

    const links = await IncidentReport.findAll({
      where: {
        incidentId,
        reportId: { [Op.in]: payload.reportIds },
        active: true,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (links.length !== payload.reportIds.length) {
      throw AppError.conflict(
        'Every report must be actively linked to this incident',
        'SPLIT_REPORT_NOT_LINKED'
      );
    }

    const reports = await Report.findAll({
      where: { id: { [Op.in]: payload.reportIds } },
      transaction,
    });
    if (reports.length !== payload.reportIds.length) {
      throw AppError.notFound('One or more reports were not found', 'REPORT_NOT_FOUND');
    }

    const observedTimes = reports.map((report) => new Date(report.observedAt).getTime());
    const firstSeenAt = new Date(Math.min(...observedTimes));
    const lastSeenAt = new Date(Math.max(...observedTimes));
    const ttlHours = getIncidentTtlHours(
      payload.category || source.category,
      env.INCIDENT_DEFAULT_TTL_HOURS
    );

    const newIncident = await Incident.create(
      {
        campusId: source.campusId,
        createdByUserId: actor.id,
        title: payload.title || `${source.title} (split)`.slice(0, 160),
        category: payload.category || source.category,
        status: 'reported',
        publicSummary:
          payload.publicSummary ||
          `A group of reports was separated for independent moderator review. Not independently verified.`,
        firstSeenAt,
        lastSeenAt,
        expiresAt: new Date(lastSeenAt.getTime() + ttlHours * 60 * 60 * 1000),
        locationName: payload.locationName || source.locationName,
        latitude: payload.latitude ?? source.latitude,
        longitude: payload.longitude ?? source.longitude,
        affectedRadiusMeters: payload.affectedRadiusMeters || source.affectedRadiusMeters,
        reportCount: reports.length,
      },
      { transaction }
    );

    const now = new Date();
    await IncidentReport.update(
      { active: false, unlinkedAt: now },
      { where: { id: { [Op.in]: links.map((link) => link.id) } }, transaction }
    );

    for (const report of reports) {
      await IncidentReport.create(
        {
          incidentId: newIncident.id,
          reportId: report.id,
          linkedByUserId: actor.id,
          linkSource: 'moderator_split',
          rationale: payload.rationale,
          active: true,
          linkedAt: now,
        },
        { transaction }
      );
    }

    const remaining = await IncidentReport.count({
      where: { incidentId, active: true },
      transaction,
    });
    const beforeStatus = source.status;
    const sourceUpdates = { reportCount: remaining };
    if (remaining === 0) {
      sourceUpdates.status = 'rejected';
      sourceUpdates.publicSummary =
        'All reports were moved to a separate incident after moderator review.';
    }
    await source.update(sourceUpdates, { transaction });

    await recordModerationAction({
      actorUserId: actor.id,
      incidentId: source.id,
      action: MODERATION_ACTIONS.SPLIT_SOURCE,
      reasonCode: payload.reasonCode,
      evidenceNote: payload.rationale,
      beforeStatus,
      afterStatus: sourceUpdates.status || beforeStatus,
      metadata: {
        splitIncidentId: newIncident.id,
        reportIds: payload.reportIds,
        remainingReportCount: remaining,
      },
      transaction,
    });

    await recordModerationAction({
      actorUserId: actor.id,
      incidentId: newIncident.id,
      action: MODERATION_ACTIONS.SPLIT_TARGET,
      reasonCode: payload.reasonCode,
      evidenceNote: payload.rationale,
      beforeStatus: null,
      afterStatus: 'reported',
      metadata: {
        sourceIncidentId: source.id,
        reportIds: payload.reportIds,
      },
      transaction,
    });

    const [hydratedSource, hydratedNew] = await Promise.all([
      hydrateIncident(source.id, transaction),
      hydrateIncident(newIncident.id, transaction),
    ]);

    return { source: hydratedSource, incident: hydratedNew };
  });

  return {
    sourceIncident: incidentBase(result.source, { viewer: actor }),
    incident: incidentBase(result.incident, { viewer: actor }),
  };
};

const getQueue = async ({ query }) => getModerationQueue({ query });

const listReports = async ({ query }) => {
  const result = await searchReportsForModeration(query);
  return result;
};

module.exports = {
  recordDecision,
  mergeIncidents,
  splitIncident,
  getQueue,
  listReports,
};
