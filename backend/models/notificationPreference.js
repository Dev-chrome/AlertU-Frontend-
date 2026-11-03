'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationPreference extends Model {
    static associate(models) {
      NotificationPreference.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  NotificationPreference.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      categories: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: 'NotificationPreference',
      tableName: 'notification_preferences',
      timestamps: true,
    }
  );

  return NotificationPreference;
};
