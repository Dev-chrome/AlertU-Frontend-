'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Adds the JWT/bcrypt auth fields while preserving existing Firebase users.
 *
 * Existing rows keep their data. A random unusable password hash is assigned
 * to legacy accounts so they must be given a new password before they can log
 * in through the JWT flow.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "users" ALTER COLUMN "firebaseUid" DROP NOT NULL;'
    );

    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'lastLogin', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET "username" = COALESCE(
        NULLIF("displayName", ''),
        NULLIF(split_part("email", '@', 1), ''),
        'user-' || left("id"::text, 8)
      )
      WHERE "username" IS NULL;
    `);

    const legacyPasswordHash = bcrypt.hashSync(crypto.randomUUID(), 12);
    await queryInterface.sequelize.query(
      'UPDATE "users" SET "password" = :hash WHERE "password" IS NULL;',
      { replacements: { hash: legacyPasswordHash } }
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;'
    );

    await queryInterface.removeConstraint('users', 'users_role_check');
    await queryInterface.addConstraint('users', {
      fields: ['role'],
      type: 'check',
      where: { role: ['sharer', 'supporter', 'student', 'moderator', 'admin'] },
      name: 'users_role_check',
    });

    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_unique_idx',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'users_email_unique_idx');

    await queryInterface.removeConstraint('users', 'users_role_check');
    await queryInterface.addConstraint('users', {
      fields: ['role'],
      type: 'check',
      where: { role: ['student', 'moderator', 'admin'] },
      name: 'users_role_check',
    });

    await queryInterface.removeColumn('users', 'lastLogin');
    await queryInterface.removeColumn('users', 'password');
    await queryInterface.removeColumn('users', 'username');

    await queryInterface.sequelize.query(
      'ALTER TABLE "users" ALTER COLUMN "firebaseUid" SET NOT NULL;'
    );
  },
};
