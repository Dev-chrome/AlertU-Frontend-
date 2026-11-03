'use strict';

const INCIDENT_STATUSES = Object.freeze({
  REPORTED: 'reported',
  CANDIDATE: 'candidate',
  CORROBORATED: 'corroborated',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  DISPUTED: 'disputed',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
  EXPIRED: 'expired',
  REOPENED: 'reopened',
});

const ALL_INCIDENT_STATUSES = Object.freeze(Object.values(INCIDENT_STATUSES));

const REPORT_CATEGORIES = Object.freeze([
  'safety',
  'harassment',
  'theft',
  'vandalism',
  'infrastructure',
  'medical',
  'fire',
  'other',
]);

const ACTIVE_STATUSES = Object.freeze([
  INCIDENT_STATUSES.REPORTED,
  INCIDENT_STATUSES.CANDIDATE,
  INCIDENT_STATUSES.CORROBORATED,
  INCIDENT_STATUSES.UNDER_REVIEW,
  INCIDENT_STATUSES.VERIFIED,
  INCIDENT_STATUSES.DISPUTED,
  INCIDENT_STATUSES.REOPENED,
]);

const QUEUE_STATUSES = Object.freeze([
  INCIDENT_STATUSES.REPORTED,
  INCIDENT_STATUSES.CANDIDATE,
  INCIDENT_STATUSES.UNDER_REVIEW,
  INCIDENT_STATUSES.DISPUTED,
  INCIDENT_STATUSES.REOPENED,
]);

const PUBLIC_STATUSES = Object.freeze([
  ...ACTIVE_STATUSES,
  INCIDENT_STATUSES.RESOLVED,
  INCIDENT_STATUSES.EXPIRED,
]);

const STATUS_LABELS = Object.freeze({
  [INCIDENT_STATUSES.REPORTED]: 'Reported',
  [INCIDENT_STATUSES.CANDIDATE]: 'Candidate',
  [INCIDENT_STATUSES.CORROBORATED]: 'Corroborated',
  [INCIDENT_STATUSES.UNDER_REVIEW]: 'Under review',
  [INCIDENT_STATUSES.VERIFIED]: 'Verified',
  [INCIDENT_STATUSES.DISPUTED]: 'Disputed',
  [INCIDENT_STATUSES.REJECTED]: 'Rejected',
  [INCIDENT_STATUSES.RESOLVED]: 'Resolved',
  [INCIDENT_STATUSES.EXPIRED]: 'Expired',
  [INCIDENT_STATUSES.REOPENED]: 'Reopened',
});

const CATEGORY_LABELS = Object.freeze({
  safety: 'Safety',
  harassment: 'Harassment',
  theft: 'Theft',
  vandalism: 'Vandalism',
  infrastructure: 'Infrastructure',
  medical: 'Medical',
  fire: 'Fire',
  other: 'Other',
});

const MODERATION_ACTIONS = Object.freeze({
  DECISION: 'decision',
  MERGE_SOURCE: 'merge_source',
  MERGE_TARGET: 'merge_target',
  SPLIT_SOURCE: 'split_source',
  SPLIT_TARGET: 'split_target',
  SYSTEM_EXPIRED: 'system_expired',
});

const isActiveStatus = (status) => ACTIVE_STATUSES.includes(status);
const isPublicStatus = (status) => PUBLIC_STATUSES.includes(status);
const isNotifiableStatus = (status) =>
  [
    INCIDENT_STATUSES.VERIFIED,
    INCIDENT_STATUSES.RESOLVED,
    INCIDENT_STATUSES.EXPIRED,
  ].includes(status);

const getIncidentTtlHours = (category, fallbackHours = 24) => {
  if (category === 'fire' || category === 'medical') return 6;
  if (category === 'safety' || category === 'harassment') return 24;
  return fallbackHours;
};

module.exports = {
  INCIDENT_STATUSES,
  ALL_INCIDENT_STATUSES,
  REPORT_CATEGORIES,
  ACTIVE_STATUSES,
  QUEUE_STATUSES,
  PUBLIC_STATUSES,
  STATUS_LABELS,
  CATEGORY_LABELS,
  MODERATION_ACTIONS,
  isActiveStatus,
  isPublicStatus,
  isNotifiableStatus,
  getIncidentTtlHours,
};
