'use strict';

const { Model } = require('sequelize');

const POST_TYPES = ['gist', 'news', 'event'];
const POST_STATUSES = ['published', 'hidden', 'removed'];

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.Campus, { foreignKey: 'campusId', as: 'campus' });
      Post.belongsTo(models.User, { foreignKey: 'authorUserId', as: 'author' });
      Post.hasMany(models.PostLike, { foreignKey: 'postId', as: 'likes' });
      Post.hasMany(models.PostComment, { foreignKey: 'postId', as: 'comments' });
      Post.belongsToMany(models.User, {
        through: models.PostLike,
        foreignKey: 'postId',
        otherKey: 'userId',
        as: 'likedByUsers',
      });
    }
  }

  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      campusId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      authorUserId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'gist',
        validate: { isIn: [POST_TYPES] },
      },
      title: {
        type: DataTypes.STRING(160),
        allowNull: true,
        validate: { len: [0, 160] },
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { len: [1, 5000] },
      },
      mediaRefs: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'published',
        validate: { isIn: [POST_STATUSES] },
      },
      isPinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      likeCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      commentCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      timestamps: true,
      indexes: [
        { fields: ['campusId', 'status', 'createdAt'] },
        { fields: ['authorUserId'] },
        { fields: ['type', 'status'] },
      ],
    }
  );

  Post.POST_TYPES = POST_TYPES;
  Post.POST_STATUSES = POST_STATUSES;

  return Post;
};
