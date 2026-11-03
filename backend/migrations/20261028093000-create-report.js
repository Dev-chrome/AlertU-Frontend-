'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      reporterUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      campusId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'campuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      category: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      observedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      locationName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
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

    await queryInterface.addIndex('reports', ['reporterUserId'], {
      name: 'reports_reporter_user_id_idx',
    });
    await queryInterface.addIndex('reports', ['campusId', 'observedAt'], {
      name: 'reports_campus_observed_idx',
    });
    await queryInterface.addIndex('reports', ['category'], {
      name: 'reports_category_idx',
    });
    await queryInterface.addIndex('reports', ['latitude', 'longitude'], {
      name: 'reports_lat_lng_idx',
    });
    await queryInterface.addConstraint('reports', {
      fields: ['category'],
      type: 'check',
      where: {
        category: [
          'safety',
          'harassment',
          'theft',
          'vandalism',
          'infrastructure',
          'medical',
          'fire',
          'other',
        ],
      },
      name: 'reports_category_check',
    });
    await queryInterface.addConstraint('reports', {
      fields: ['latitude'],
      type: 'check',
      where: { latitude: { [Sequelize.Op.between]: [-90, 90] } },
      name: 'reports_latitude_check',
    });
    await queryInterface.addConstraint('reports', {
      fields: ['longitude'],
      type: 'check',
      where: { longitude: { [Sequelize.Op.between]: [-180, 180] } },
      name: 'reports_longitude_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reports');
  },
};
