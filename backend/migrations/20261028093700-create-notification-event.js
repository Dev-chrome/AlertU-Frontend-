'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      eventType: {
        type: Sequelize.STRING(48),
        allowNull: false,
      },
      dedupeKey: {
        type: Sequelize.STRING(240),
        allowNull: false,
        unique: true,
      },
      state: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: 'pending',
      },
      incidentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'incidents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      recipientUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'{}'::jsonb"),
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastError: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sentAt: {
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

    await queryInterface.addIndex('notification_events', ['state', 'createdAt'], {
      name: 'notification_events_state_created_idx',
    });
    await queryInterface.addIndex('notification_events', ['recipientUserId'], {
      name: 'notification_events_recipient_idx',
    });
    await queryInterface.addIndex('notification_events', ['incidentId'], {
      name: 'notification_events_incident_idx',
    });
    await queryInterface.addConstraint('notification_events', {
      fields: ['state'],
      type: 'check',
      where: { state: ['pending', 'processing', 'sent', 'failed', 'skipped'] },
      name: 'notification_events_state_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notification_events');
  },
};
