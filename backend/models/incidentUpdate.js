'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class IncidentUpdate extends Model {
    static associate(models) {
      IncidentUpdate.belongsTo(models.Incident, { foreignKey: 'incidentId', as: 'incident' });
      IncidentUpdate.belongsTo(models.User, { foreignKey: 'authorUserId', as: 'author' });
    }
  }

  IncidentUpdate.init(
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
      authorUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { len: [3, 2000] },
      },
      observedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      locationName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
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
      modelName: 'IncidentUpdate',
      tableName: 'incident_updates',
      timestamps: true,
      indexes: [
        { fields: ['incidentId', 'observedAt'] },
        { fields: ['authorUserId'] },
      ],
    }
  );

  return IncidentUpdate;
};
