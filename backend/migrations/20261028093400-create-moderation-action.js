'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('moderation_actions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      actorUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      incidentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'incidents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      reportId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'reports', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      action: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      reasonCode: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      evidenceNote: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      beforeStatus: {
        type: Sequelize.STRING(24),
        allowNull: true,
      },
      afterStatus: {
        type: Sequelize.STRING(24),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'{}'::jsonb"),
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

    await queryInterface.addIndex('moderation_actions', ['incidentId', 'createdAt'], {
      name: 'moderation_actions_incident_created_idx',
    });
    await queryInterface.addIndex('moderation_actions', ['reportId'], {
      name: 'moderation_actions_report_idx',
    });
    await queryInterface.addIndex('moderation_actions', ['actorUserId'], {
      name: 'moderation_actions_actor_idx',
    });
    await queryInterface.addConstraint('moderation_actions', {
      fields: ['action'],
      type: 'check',
      where: {
        action: [
          'decision',
          'merge_target',
          'merge_source',
          'split_source',
          'split_target',
          'system_expired',
        ],
      },
      name: 'moderation_actions_action_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('moderation_actions');
  },
};
