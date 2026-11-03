"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.belongsTo(models.Campus, { foreignKey: "campusId", as: "campus" });
      Users.hasMany(models.DeviceToken, {
        foreignKey: "userId",
        as: "deviceTokens",
      });
      Users.hasOne(models.NotificationPreference, {
        foreignKey: "userId",
        as: "notificationPreference",
      });
      Users.hasMany(models.NotificationEvent, {
        foreignKey: "recipientUserId",
        as: "recipientEvents",
      });
      Users.hasMany(models.Report, {
        foreignKey: "reporterUserId",
        as: "reports",
      });
      Users.hasMany(models.Incident, {
        foreignKey: "createdByUserId",
        as: "createdIncidents",
      });
      Users.hasMany(models.Post, {
        foreignKey: "authorUserId",
        as: "posts",
      });
    }
  }

  Users.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firebaseUid: {
        type: DataTypes.STRING(128),
        allowNull: true,
        unique: true,
      },
      displayName: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: "AlertU user",
        validate: { len: [1, 120] },
      },
      username: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { len: [4, 120] },
      },
      email: {
        type: DataTypes.STRING(320),
        allowNull: true,
        unique: true,
        validate: {
          isEmail(value) {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              throw new Error("Email must be a valid email address");
            }
          },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "student",
        validate: {
          isIn: [["sharer", "supporter", "student", "moderator", "admin"]],
        },
      },
      campusId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      accountStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active",
        validate: {
          isIn: [["active", "suspended", "deactivated"]],
        },
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "users",
      timestamps: true,
    }
  );

  return Users;
};
