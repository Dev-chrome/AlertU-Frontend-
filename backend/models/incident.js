'use strict';

const { Model } = require('sequelize');
const { ALL_INCIDENT_STATUSES, INCIDENT_STATUSES, REPORT_CATEGORIES } = require('../constants/incident');

module.exports = (sequelize, DataTypes) => {
  class Incident extends Model {
    static associate(models) {
      Incident.belongsTo(models.Campus, { foreignKey: 'campusId', as: 'campus' });
      Incident.belongsTo(models.User, { foreignKey: 'createdByUserId', as: 'creator' });
      Incident.hasMany(models.IncidentReport, { foreignKey: 'incidentId', as: 'reportLinks' });
      Incident.belongsToMany(models.Report, {
        through: models.IncidentReport,
        foreignKey: 'incidentId',
        otherKey: 'reportId',
        as: 'reports',
      });
      Incident.hasMany(models.IncidentUpdate, { foreignKey: 'incidentId', as: 'updates' });
      Incident.hasMany(models.ModerationAction, {
        foreignKey: 'incidentId',
        as: 'moderationActions',
      });
      Incident.hasMany(models.NotificationEvent, {
        foreignKey: 'incidentId',
        as: 'notificationEvents',
      });
    }
  }

  Incident.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      campusId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(160),
        allowNull: false,
        validate: { len: [3, 160] },
      },
      category: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: { isIn: [REPORT_CATEGORIES] },
      },
      status: {
        type: DataTypes.STRING(24),
        allowNull: false,
        defaultValue: INCIDENT_STATUSES.REPORTED,
        validate: { isIn: [ALL_INCIDENT_STATUSES] },
      },
      publicSummary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      firstSeenAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      locationName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
      },
      affectedRadiusMeters: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 150,
      },
      reportCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
    },
    {
      sequelize,
      modelName: 'Incident',
      tableName: 'incidents',
      timestamps: true,
      indexes: [
        { fields: ['campusId', 'status'] },
        { fields: ['status', 'lastSeenAt'] },
        { fields: ['category'] },
        { fields: ['expiresAt'] },
        { fields: ['latitude', 'longitude'] },
      ],
    }
  );

  return Incident;
};
