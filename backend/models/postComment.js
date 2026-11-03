'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostComment extends Model {
    static associate(models) {
      PostComment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
      PostComment.belongsTo(models.User, { foreignKey: 'authorUserId', as: 'author' });
    }
  }

  PostComment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      authorUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { len: [1, 1000] },
      },
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'visible',
        validate: { isIn: [['visible', 'hidden']] },
      },
    },
    {
      sequelize,
      modelName: 'PostComment',
      tableName: 'post_comments',
      timestamps: true,
      indexes: [
        { fields: ['postId', 'status', 'createdAt'] },
        { fields: ['authorUserId'] },
      ],
    }
  );

  return PostComment;
};
