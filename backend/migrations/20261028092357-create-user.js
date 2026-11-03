'use strict';

/**
 * Baseline users table.
 *
 * The previous scaffold migration created an integer-ID Users table with three
 * free-text columns. It had never been applied (the target database was verified
 * empty), so it is replaced here by the real UUID baseline before any schema is
 * deployed. Future changes must be additive migrations, not edits to this file.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      firebaseUid: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true,
      },
      displayName: {
        type: Sequelize.STRING(120),
        allowNull: false,
        defaultValue: 'AlertU user',
      },
      email: {
        type: Sequelize.STRING(320),
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'student',
      },
      campusId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'campuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      accountStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active',
      },
      lastSeenAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_idx',
    });
    await queryInterface.addIndex('users', ['campusId'], {
      name: 'users_campus_id_idx',
    });
    await queryInterface.addIndex('users', ['role'], {
      name: 'users_role_idx',
    });
    await queryInterface.addConstraint('users', {
      fields: ['role'],
      type: 'check',
      where: { role: ['student', 'moderator', 'admin'] },
      name: 'users_role_check',
    });
    await queryInterface.addConstraint('users', {
      fields: ['accountStatus'],
      type: 'check',
      where: { accountStatus: ['active', 'suspended', 'deactivated'] },
      name: 'users_account_status_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
