'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('incident_updates', {
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
      authorUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      observedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      locationName: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },
      mediaRefs: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'[]'::jsonb"),
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('incident_updates', ['incidentId', 'observedAt'], {
      name: 'incident_updates_incident_observed_idx',
    });
    await queryInterface.addIndex('incident_updates', ['authorUserId'], {
      name: 'incident_updates_author_idx',
    });
    await queryInterface.addConstraint('incident_updates', {
      fields: ['latitude'],
      type: 'check',
      where: {
        latitude: {
          [Sequelize.Op.or]: [
            { [Sequelize.Op.eq]: null },
            { [Sequelize.Op.between]: [-90, 90] },
          ],
        },
      },
      name: 'incident_updates_latitude_check',
    });
    await queryInterface.addConstraint('incident_updates', {
      fields: ['longitude'],
      type: 'check',
      where: {
        longitude: {
          [Sequelize.Op.or]: [
            { [Sequelize.Op.eq]: null },
            { [Sequelize.Op.between]: [-180, 180] },
          ],
        },
      },
      name: 'incident_updates_longitude_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('incident_updates');
  },
};
