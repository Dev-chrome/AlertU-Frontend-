'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class IncidentReport extends Model {
    static associate(models) {
      IncidentReport.belongsTo(models.Incident, { foreignKey: 'incidentId', as: 'incident' });
      IncidentReport.belongsTo(models.Report, { foreignKey: 'reportId', as: 'report' });
      IncidentReport.belongsTo(models.User, { foreignKey: 'linkedByUserId', as: 'linkedBy' });
    }
  }

  IncidentReport.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      incidentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reportId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      linkedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      linkSource: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'initial_report',
        validate: {
          isIn: [['initial_report', 'moderator_merge', 'moderator_split', 'system']],
        },
      },
      rationale: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      linkedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      unlinkedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'IncidentReport',
      tableName: 'incident_reports',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['incidentId', 'reportId'] },
        { fields: ['incidentId'] },
        { fields: ['reportId'] },
      ],
    }
  );

  return IncidentReport;
};
