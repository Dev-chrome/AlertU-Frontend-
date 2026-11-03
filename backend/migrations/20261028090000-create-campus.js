'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campuses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(160),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      timezone: {
        type: Sequelize.STRING(64),
        allowNull: false,
        defaultValue: 'UTC',
      },
      centerLatitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },
      centerLongitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },
      // GeoJSON boundary placeholder. PostGIS can be added later without
      // changing the API contract.
      boundary: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      isActive: {
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

    await queryInterface.addIndex('campuses', ['isActive'], {
      name: 'campuses_is_active_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campuses');
  },
};
