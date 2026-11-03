'use strict';

const ROLES = Object.freeze({
  STUDENT: 'student',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SHARER: 'sharer',
  SUPPORTER: 'supporter',
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));
const STAFF_ROLES = Object.freeze([ROLES.MODERATOR, ROLES.ADMIN]);

const isModerator = (user) => Boolean(user && STAFF_ROLES.includes(user.role));

module.exports = {
  ROLES,
  ALL_ROLES,
  STAFF_ROLES,
  isModerator,
};
