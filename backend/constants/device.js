'use strict';

const DEVICE_PLATFORMS = Object.freeze(['android', 'ios', 'web']);

const NOTIFICATION_EVENT_STATES = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  SENT: 'sent',
  FAILED: 'failed',
  SKIPPED: 'skipped',
});

const ALL_NOTIFICATION_EVENT_STATES = Object.freeze(
  Object.values(NOTIFICATION_EVENT_STATES)
);

module.exports = {
  DEVICE_PLATFORMS,
  NOTIFICATION_EVENT_STATES,
  ALL_NOTIFICATION_EVENT_STATES,
};
