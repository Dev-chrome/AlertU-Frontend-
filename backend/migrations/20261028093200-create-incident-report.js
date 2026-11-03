'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('incident_reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      incidentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'incidents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      reportId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'reports', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      linkedByUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      linkSource: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 'initial_report',
      },
      rationale: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      linkedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      unlinkedAt: {
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

    await queryInterface.addIndex('incident_reports', ['incidentId'], {
      name: 'incident_reports_incident_id_idx',
    });
    await queryInterface.addIndex('incident_reports', ['reportId'], {
      name: 'incident_reports_report_id_idx',
    });
    await queryInterface.addIndex('incident_reports', ['incidentId', 'reportId'], {
      unique: true,
      name: 'incident_reports_incident_report_unique',
    });
    // A report may be evidence for only one active incident. Inactive rows
    // preserve merge/split provenance without blocking a later review.
    await queryInterface.addIndex('incident_reports', ['reportId'], {
      unique: true,
      where: { active: true },
      name: 'incident_reports_one_active_report_unique',
    });
    await queryInterface.addConstraint('incident_reports', {
      fields: ['linkSource'],
      type: 'check',
      where: {
        linkSource: ['initial_report', 'moderator_merge', 'moderator_split', 'system'],
      },
      name: 'incident_reports_link_source_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('incident_reports');
  },
};
