'use strict';

const { ModerationAction } = require('../models');

const recordModerationAction = async ({
  actorUserId = null,
  incidentId = null,
  reportId = null,
  action,
  reasonCode,
  evidenceNote = null,
  beforeStatus = null,
  afterStatus = null,
  metadata = {},
  transaction,
}) => {
  return ModerationAction.create(
    {
      actorUserId,
      incidentId,
      reportId,
      action,
      reasonCode,
      evidenceNote,
      beforeStatus,
      afterStatus,
      metadata,
    },
    { transaction }
  );
};

module.exports = {
  recordModerationAction,
};
