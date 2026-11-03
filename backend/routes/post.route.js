'use strict';

const express = require('express');
const validate = require('../middleware/validate.middleware');
const { writeLimiter } = require('../middleware/rateLimit.middleware');
const {
  createCommentSchema,
  createPostSchema,
  listPostsQuery,
  postParams,
  commentParams,
} = require('../validator/post.validator');
const { paginationQuery } = require('../validator/common.validator');
const controller = require('../controller/post.controller');

const createPostRouter = ({ authenticate, optionalAuth }) => {
  const router = express.Router();

  router.get('/', optionalAuth, validate({ query: listPostsQuery }), controller.listPosts);
  router.post(
    '/',
    authenticate,
    writeLimiter,
    validate({ body: createPostSchema }),
    controller.createPost
  );
  router.get('/:id', optionalAuth, validate({ params: postParams }), controller.getPost);
  router.delete('/:id', authenticate, writeLimiter, validate({ params: postParams }), controller.removePost);

  router.post('/:id/like', authenticate, writeLimiter, validate({ params: postParams }), controller.likePost);
  router.delete('/:id/like', authenticate, writeLimiter, validate({ params: postParams }), controller.unlikePost);

  router.get(
    '/:id/comments',
    optionalAuth,
    validate({ params: postParams, query: paginationQuery }),
    controller.listComments
  );
  router.post(
    '/:id/comments',
    authenticate,
    writeLimiter,
    validate({ params: postParams, body: createCommentSchema }),
    controller.addComment
  );
  router.delete(
    '/:id/comments/:commentId',
    authenticate,
    writeLimiter,
    validate({ params: commentParams }),
    controller.removeComment
  );

  return router;
};

module.exports = createPostRouter;
