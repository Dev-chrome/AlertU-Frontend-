'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('incidents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      campusId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'campuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdByUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.STRING(160),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(24),
        allowNull: false,
        defaultValue: 'reported',
      },
      publicSummary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      firstSeenAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastSeenAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
      affectedRadiusMeters: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 150,
      },
      reportCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex('incidents', ['campusId', 'status'], {
      name: 'incidents_campus_status_idx',
    });
    await queryInterface.addIndex('incidents', ['status', 'lastSeenAt'], {
      name: 'incidents_status_last_seen_idx',
    });
    await queryInterface.addIndex('incidents', ['category'], {
      name: 'incidents_category_idx',
    });
    await queryInterface.addIndex('incidents', ['latitude', 'longitude'], {
      name: 'incidents_lat_lng_idx',
    });
    await queryInterface.addIndex('incidents', ['expiresAt'], {
      name: 'incidents_expires_at_idx',
    });
    await queryInterface.addConstraint('incidents', {
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
      name: 'incidents_category_check',
    });
    await queryInterface.addConstraint('incidents', {
      fields: ['status'],
      type: 'check',
      where: {
        status: [
          'reported',
          'candidate',
          'corroborated',
          'under_review',
          'verified',
          'disputed',
          'rejected',
          'resolved',
          'expired',
          'reopened',
        ],
      },
      name: 'incidents_status_check',
    });
    await queryInterface.addConstraint('incidents', {
      fields: ['latitude'],
      type: 'check',
      where: { latitude: { [Sequelize.Op.between]: [-90, 90] } },
      name: 'incidents_latitude_check',
    });
    await queryInterface.addConstraint('incidents', {
      fields: ['longitude'],
      type: 'check',
      where: { longitude: { [Sequelize.Op.between]: [-180, 180] } },
      name: 'incidents_longitude_check',
    });
    await queryInterface.addConstraint('incidents', {
      fields: ['reportCount'],
      type: 'check',
      where: { reportCount: { [Sequelize.Op.gte]: 0 } },
      name: 'incidents_report_count_check',
    });
    await queryInterface.addConstraint('incidents', {
      fields: ['affectedRadiusMeters'],
      type: 'check',
      where: { affectedRadiusMeters: { [Sequelize.Op.gt]: 0 } },
      name: 'incidents_radius_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('incidents');
  },
};
