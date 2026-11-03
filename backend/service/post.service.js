'use strict';

const { Op } = require('sequelize');
const {
  Campus,
  Post,
  PostComment,
  PostLike,
  User,
  sequelize,
} = require('../models');
const AppError = require('../util/AppError');
const { isModerator } = require('../constants/roles');
const { post: serializePost, postComment: serializeComment } = require('../util/serializers');
const { queuePostEvent, dispatchEventIds } = require('./notification.service');

const resolvePostCampus = async ({ user, campusId }) => {
  if (campusId && user.role === 'student' && user.campusId && user.campusId !== campusId) {
    throw AppError.forbidden(
      'Students may only post to their own campus',
      'CAMPUS_SCOPE_FORBIDDEN'
    );
  }
  const resolvedId = campusId || user.campusId;
  if (!resolvedId) {
    throw AppError.badRequest(
      'campusId is required because this account is not assigned to a campus',
      undefined,
      'CAMPUS_REQUIRED'
    );
  }
  const campus = await Campus.findOne({ where: { id: resolvedId, isActive: true } });
  if (!campus) throw AppError.badRequest('Campus not found or inactive', undefined, 'CAMPUS_INVALID');
  return campus;
};

const listPosts = async ({ query, viewer }) => {
  const where = { status: 'published' };

  if (query.campusId) where.campusId = query.campusId;
  else if (viewer && viewer.campusId) where.campusId = viewer.campusId;

  if (query.type) where.type = query.type;
  if (query.authorUserId) where.authorUserId = query.authorUserId;
  if (query.q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${query.q}%` } },
      { body: { [Op.iLike]: `%${query.q}%` } },
    ];
  }

  const order =
    query.sort === 'popular'
      ? [
          ['isPinned', 'DESC'],
          ['likeCount', 'DESC'],
          ['createdAt', 'DESC'],
        ]
      : [
          ['isPinned', 'DESC'],
          ['createdAt', 'DESC'],
        ];

  const { rows, count } = await Post.findAndCountAll({
    where,
    order,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
    include: [
      { model: User, as: 'author', attributes: ['id', 'displayName', 'role'] },
      { model: Campus, as: 'campus', attributes: ['id', 'name', 'slug'] },
    ],
  });

  let likedIds = new Set();
  if (viewer && rows.length > 0) {
    const likes = await PostLike.findAll({
      where: {
        userId: viewer.id,
        postId: { [Op.in]: rows.map((row) => row.id) },
      },
      attributes: ['postId'],
    });
    likedIds = new Set(likes.map((like) => like.postId));
  }

  return {
    posts: rows.map((record) =>
      serializePost(record, { viewer, liked: likedIds.has(record.id) })
    ),
    total: count,
  };
};

const getPost = async ({ postId, viewer }) => {
  const record = await Post.findByPk(postId, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'displayName', 'role'] },
      { model: Campus, as: 'campus', attributes: ['id', 'name', 'slug'] },
    ],
  });

  if (!record) throw AppError.notFound('Post not found', 'POST_NOT_FOUND');

  const privileged = isModerator(viewer);
  const owner = viewer && viewer.id === record.authorUserId;
  if (record.status !== 'published' && !privileged && !owner) {
    throw AppError.notFound('Post not found', 'POST_NOT_FOUND');
  }

  let liked = false;
  if (viewer) {
    liked = Boolean(
      await PostLike.findOne({ where: { postId: record.id, userId: viewer.id } })
    );
  }

  return serializePost(record, { viewer, liked });
};

const createPost = async ({ user, payload }) => {
  const campus = await resolvePostCampus({ user, campusId: payload.campusId });

  if (payload.type !== 'gist' && !payload.title) {
    throw AppError.badRequest(
      'A title is required for news and event posts',
      undefined,
      'POST_TITLE_REQUIRED'
    );
  }

  const record = await Post.create({
    campusId: campus.id,
    authorUserId: user.id,
    type: payload.type,
    title: payload.title || null,
    body: payload.body,
    mediaRefs: payload.mediaRefs || [],
    tags: payload.tags || [],
    status: 'published',
    likeCount: 0,
    commentCount: 0,
  });

  const hydrated = await Post.findByPk(record.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'displayName', 'role'] }],
  });

  return serializePost(hydrated, { viewer: user });
};

const removePost = async ({ postId, user }) => {
  const record = await Post.findByPk(postId);
  if (!record) throw AppError.notFound('Post not found', 'POST_NOT_FOUND');

  if (record.authorUserId !== user.id && !isModerator(user)) {
    throw AppError.forbidden('You may only remove your own post', 'POST_FORBIDDEN');
  }

  if (record.status !== 'removed') {
    await record.update({ status: 'removed' });
  }
  return true;
};

const likePost = async ({ postId, user }) => {
  const result = await sequelize.transaction(async (transaction) => {
    const record = await Post.findByPk(postId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!record || record.status !== 'published') {
      throw AppError.notFound('Post not found', 'POST_NOT_FOUND');
    }

    const [, created] = await PostLike.findOrCreate({
      where: { postId: record.id, userId: user.id },
      defaults: { postId: record.id, userId: user.id },
      transaction,
    });

    if (created) await record.increment('likeCount', { by: 1, transaction });

    const event = await queuePostEvent({
      post: record,
      actor: user,
      type: 'post_like',
      transaction,
    });

    return { record, liked: true, event };
  });

  if (result.event) dispatchEventIds([result.event.id]);

  return {
    liked: result.liked,
    likeCount: result.record.likeCount,
    postId: result.record.id,
  };
};

const unlikePost = async ({ postId, user }) => {
  const result = await sequelize.transaction(async (transaction) => {
    const record = await Post.findByPk(postId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!record || record.status !== 'published') {
      throw AppError.notFound('Post not found', 'POST_NOT_FOUND');
    }

    const removed = await PostLike.destroy({
      where: { postId: record.id, userId: user.id },
      transaction,
    });

    if (removed > 0) {
      await record.update(
        { likeCount: Math.max(0, record.likeCount - removed) },
        { transaction }
      );
    }

    return record;
  });

  return {
    liked: false,
    likeCount: result.likeCount,
    postId: result.id,
  };
};

const listComments = async ({ postId, viewer, page, limit }) => {
  const record = await Post.findByPk(postId);
  if (!record) throw AppError.notFound('Post not found', 'POST_NOT_FOUND');

  const privileged = isModerator(viewer);
  const owner = viewer && viewer.id === record.authorUserId;
  if (record.status !== 'published' && !privileged && !owner) {
    throw AppError.notFound('Post not found', 'POST_NOT_FOUND');
  }

  const { rows, count } = await PostComment.findAndCountAll({
    where: {
      postId,
      ...(privileged ? {} : { status: 'visible' }),
    },
    order: [['createdAt', 'ASC']],
    limit,
    offset: (page - 1) * limit,
    include: [{ model: User, as: 'author', attributes: ['id', 'displayName', 'role'] }],
  });

  return {
    comments: rows.map((comment) => serializeComment(comment, { viewer })),
    total: count,
  };
};

const addComment = async ({ postId, user, payload }) => {
  const result = await sequelize.transaction(async (transaction) => {
    const record = await Post.findByPk(postId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!record || record.status !== 'published') {
      throw AppError.notFound('Post not found', 'POST_NOT_FOUND');
    }

    const comment = await PostComment.create(
      {
        postId: record.id,
        authorUserId: user.id,
        body: payload.body,
        status: 'visible',
      },
      { transaction }
    );

    await record.increment('commentCount', { by: 1, transaction });

    const event = await queuePostEvent({
      post: record,
      actor: user,
      type: 'post_comment',
      comment,
      transaction,
    });

    const hydrated = await PostComment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'displayName', 'role'] }],
      transaction,
    });

    return { comment: hydrated, record, event };
  });

  if (result.event) dispatchEventIds([result.event.id]);

  return {
    comment: serializeComment(result.comment, { viewer: user }),
    commentCount: result.record.commentCount,
  };
};

const removeComment = async ({ postId, commentId, user }) => {
  await sequelize.transaction(async (transaction) => {
    const record = await Post.findByPk(postId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!record) throw AppError.notFound('Post not found', 'POST_NOT_FOUND');

    const comment = await PostComment.findOne({
      where: { id: commentId, postId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!comment) throw AppError.notFound('Comment not found', 'COMMENT_NOT_FOUND');

    if (comment.authorUserId !== user.id && !isModerator(user)) {
      throw AppError.forbidden('You may only remove your own comment', 'COMMENT_FORBIDDEN');
    }

    if (comment.status !== 'hidden') {
      await comment.update({ status: 'hidden' }, { transaction });
      await record.update(
        { commentCount: Math.max(0, record.commentCount - 1) },
        { transaction }
      );
    }
  });

  return true;
};

module.exports = {
  listPosts,
  getPost,
  createPost,
  removePost,
  likePost,
  unlikePost,
  listComments,
  addComment,
  removeComment,
};
