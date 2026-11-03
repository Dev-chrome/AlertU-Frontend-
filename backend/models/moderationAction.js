'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ModerationAction extends Model {
    static associate(models) {
      ModerationAction.belongsTo(models.User, { foreignKey: 'actorUserId', as: 'actor' });
      ModerationAction.belongsTo(models.Incident, { foreignKey: 'incidentId', as: 'incident' });
      ModerationAction.belongsTo(models.Report, { foreignKey: 'reportId', as: 'report' });
    }
  }

  ModerationAction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      actorUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      incidentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      reportId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      reasonCode: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      evidenceNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      beforeStatus: {
        type: DataTypes.STRING(24),
        allowNull: true,
      },
      afterStatus: {
        type: DataTypes.STRING(24),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: 'ModerationAction',
      tableName: 'moderation_actions',
      timestamps: true,
      indexes: [
        { fields: ['incidentId', 'createdAt'] },
        { fields: ['reportId'] },
        { fields: ['actorUserId'] },
      ],
    }
  );

  return ModerationAction;
};
