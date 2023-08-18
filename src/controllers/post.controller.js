const Post = require("../models/post.model");
const utils = require("../helpers/utils");
const og = require("open-graph");
const { getPagination, getCount, getPaginationData } = require("../helpers/fn");
// const socket = require("../helpers/socket.helper");
const io = require("socket.io-client");

exports.findAll = async function (req, res) {
  const { page, size, search } = req.query;
  const { limit, offset } = getPagination(page, size);
  const postData = await Post.findAll(limit, offset, search);
  return res.send(
    getPaginationData(
      { count: postData.count, docs: postData.data },
      page,
      limit
    )
  );
};

exports.getPostByProfileId = function (req, res) {
  console.log(req.params.id);
  Post.getPostByProfileId(req.params.id, function (err, post) {
    if (err) return utils.send500(res, err);
    res.send(post);
  });
};

exports.getPostByPostId = function (req, res) {
  console.log(req.params.id);
  Post.getPostByPostId(req.params.id, function (err, post) {
    if (err) return utils.send500(res, err);
    res.send(post);
  });
};

exports.createPost = function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const postData = new Post(req.body);
    console.log(postData);
    Post.create(postData, function (err, post) {
      if (err) {
        return utils.send500(res, err);
      } else {
        return res.json({
          error: false,
          mesage: "Post created",
          data: post,
        });
      }
    });
  }
};

exports.getMeta = function (req, res) {
  const url = req.body.url;
  console.log(url);
  if (url) {
    og(url, function (err, meta) {
      if (err) {
        return utils.send500(res, err);
      } else {
        return res.json({
          meta,
        });
      }
    });
  }
};

exports.deletePost = function (req, res) {
  if (req.params.id) {
    Post.delete(req.params.id, function (err, result) {
      if (err) {
        return utils.send500(res, err);
      } else {
        res.send({
          error: false,
          message: "Post deleted sucessfully",
        });
      }
    });
  } else {
    return utils.send404(res, err);
  }
};
