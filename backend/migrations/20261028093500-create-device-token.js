'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      platform: {
        type: Sequelize.STRING(12),
        allowNull: false,
      },
      appVersion: {
        type: Sequelize.STRING(32),
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastSeenAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    await queryInterface.addIndex('device_tokens', ['userId', 'active'], {
      name: 'device_tokens_user_active_idx',
    });
    await queryInterface.addIndex('device_tokens', ['active'], {
      name: 'device_tokens_active_idx',
    });
    await queryInterface.addConstraint('device_tokens', {
      fields: ['platform'],
      type: 'check',
      where: { platform: ['android', 'ios', 'web'] },
      name: 'device_tokens_platform_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_tokens');
  },
};
