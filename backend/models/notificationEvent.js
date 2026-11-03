'use strict';

const { Model } = require('sequelize');
const { ALL_NOTIFICATION_EVENT_STATES, NOTIFICATION_EVENT_STATES } = require('../constants/device');

module.exports = (sequelize, DataTypes) => {
  class NotificationEvent extends Model {
    static associate(models) {
      NotificationEvent.belongsTo(models.Incident, { foreignKey: 'incidentId', as: 'incident' });
      NotificationEvent.belongsTo(models.User, { foreignKey: 'recipientUserId', as: 'recipient' });
    }
  }

  NotificationEvent.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      eventType: {
        type: DataTypes.STRING(48),
        allowNull: false,
      },
      dedupeKey: {
        type: DataTypes.STRING(240),
        allowNull: false,
        unique: true,
      },
      state: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: NOTIFICATION_EVENT_STATES.PENDING,
        validate: { isIn: [ALL_NOTIFICATION_EVENT_STATES] },
      },
      incidentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      recipientUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastError: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'NotificationEvent',
      tableName: 'notification_events',
      timestamps: true,
      indexes: [
        { fields: ['state', 'createdAt'] },
        { fields: ['recipientUserId'] },
        { fields: ['incidentId'] },
      ],
    }
  );

  return NotificationEvent;
};
