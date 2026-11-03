'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      campusId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'campuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      authorUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      type: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: 'gist',
      },
      title: {
        type: Sequelize.STRING(160),
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      mediaRefs: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'[]'::jsonb"),
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'[]'::jsonb"),
      },
      status: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: 'published',
      },
      isPinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      likeCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      commentCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('posts', ['campusId', 'status', 'createdAt'], {
      name: 'posts_campus_status_created_idx',
    });
    await queryInterface.addIndex('posts', ['authorUserId'], {
      name: 'posts_author_idx',
    });
    await queryInterface.addIndex('posts', ['type', 'status'], {
      name: 'posts_type_status_idx',
    });
    await queryInterface.addConstraint('posts', {
      fields: ['type'],
      type: 'check',
      where: { type: ['gist', 'news', 'event'] },
      name: 'posts_type_check',
    });
    await queryInterface.addConstraint('posts', {
      fields: ['status'],
      type: 'check',
      where: { status: ['published', 'hidden', 'removed'] },
      name: 'posts_status_check',
    });
    await queryInterface.addConstraint('posts', {
      fields: ['likeCount'],
      type: 'check',
      where: { likeCount: { [Sequelize.Op.gte]: 0 } },
      name: 'posts_like_count_check',
    });
    await queryInterface.addConstraint('posts', {
      fields: ['commentCount'],
      type: 'check',
      where: { commentCount: { [Sequelize.Op.gte]: 0 } },
      name: 'posts_comment_count_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  },
};
