'use strict';

const { Model } = require('sequelize');
const { DEVICE_PLATFORMS } = require('../constants/device');

module.exports = (sequelize, DataTypes) => {
  class DeviceToken extends Model {
    static associate(models) {
      DeviceToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  DeviceToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: { len: [20, 4096] },
      },
      platform: {
        type: DataTypes.STRING(12),
        allowNull: false,
        validate: { isIn: [DEVICE_PLATFORMS] },
      },
      appVersion: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'DeviceToken',
      tableName: 'device_tokens',
      timestamps: true,
      indexes: [{ fields: ['userId', 'active'] }, { fields: ['active'] }],
    }
  );

  return DeviceToken;
};
