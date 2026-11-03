'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Campus extends Model {
    static associate(models) {
      Campus.hasMany(models.User, { foreignKey: 'campusId', as: 'users' });
      Campus.hasMany(models.Report, { foreignKey: 'campusId', as: 'reports' });
      Campus.hasMany(models.Incident, { foreignKey: 'campusId', as: 'incidents' });
      Campus.hasMany(models.Post, { foreignKey: 'campusId', as: 'posts' });
    }
  }

  Campus.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
      },
      timezone: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: 'UTC',
      },
      centerLatitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      centerLongitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      boundary: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Campus',
      tableName: 'campuses',
      timestamps: true,
    }
  );

  return Campus;
};
