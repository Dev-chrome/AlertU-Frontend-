'use strict';

const { Model } = require('sequelize');
const { REPORT_CATEGORIES } = require('../constants/incident');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      Report.belongsTo(models.User, { foreignKey: 'reporterUserId', as: 'reporter' });
      Report.belongsTo(models.Campus, { foreignKey: 'campusId', as: 'campus' });
      Report.hasMany(models.IncidentReport, { foreignKey: 'reportId', as: 'incidentLinks' });
      Report.belongsToMany(models.Incident, {
        through: models.IncidentReport,
        foreignKey: 'reportId',
        otherKey: 'incidentId',
        as: 'incidents',
      });
      Report.hasMany(models.ModerationAction, { foreignKey: 'reportId', as: 'moderationActions' });
    }
  }

  Report.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reporterUserId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      campusId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: { isIn: [REPORT_CATEGORIES] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { len: [5, 4000] },
      },
      observedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      locationName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
        validate: { min: -90, max: 90 },
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
        validate: { min: -180, max: 180 },
      },
      mediaRefs: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      isAnonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'reports',
      timestamps: true,
      indexes: [
        { fields: ['reporterUserId'] },
        { fields: ['campusId', 'observedAt'] },
        { fields: ['category'] },
        { fields: ['latitude', 'longitude'] },
      ],
    }
  );

  return Report;
};
