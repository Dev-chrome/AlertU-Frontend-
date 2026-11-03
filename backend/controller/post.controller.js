'use strict';

const asyncHandler = require('../util/asyncHandler');
const { paginationMeta } = require('../util/pagination');
const postService = require('../service/post.service');

const listPosts = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const { posts, total } = await postService.listPosts({
    query: req.validated.query,
    viewer: req.user,
  });
  res.status(200).json({
    data: posts,
    meta: paginationMeta({ page, limit, total }),
  });
});

const getPost = asyncHandler(async (req, res) => {
  const record = await postService.getPost({
    postId: req.validated.params.id,
    viewer: req.user,
  });
  res.status(200).json({ data: record });
});

const createPost = asyncHandler(async (req, res) => {
  const record = await postService.createPost({
    user: req.user,
    payload: req.validated.body,
  });
  res.status(201).json({ data: record });
});

const removePost = asyncHandler(async (req, res) => {
  await postService.removePost({
    postId: req.validated.params.id,
    user: req.user,
  });
  res.status(204).send();
});

const likePost = asyncHandler(async (req, res) => {
  const result = await postService.likePost({
    postId: req.validated.params.id,
    user: req.user,
  });
  res.status(200).json({ data: result });
});

const unlikePost = asyncHandler(async (req, res) => {
  const result = await postService.unlikePost({
    postId: req.validated.params.id,
    user: req.user,
  });
  res.status(200).json({ data: result });
});

const listComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const { comments, total } = await postService.listComments({
    postId: req.validated.params.id,
    viewer: req.user,
    page,
    limit,
  });
  res.status(200).json({
    data: comments,
    meta: paginationMeta({ page, limit, total }),
  });
});

const addComment = asyncHandler(async (req, res) => {
  const result = await postService.addComment({
    postId: req.validated.params.id,
    user: req.user,
    payload: req.validated.body,
  });
  res.status(201).json({ data: result });
});

const removeComment = asyncHandler(async (req, res) => {
  await postService.removeComment({
    postId: req.validated.params.id,
    commentId: req.validated.params.commentId,
    user: req.user,
  });
  res.status(204).send();
});

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
