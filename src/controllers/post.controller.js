const Post = require("../models/post.model");
const utils = require("../helpers/utils");
const og = require("open-graph");
const { getPagination, getCount, getPaginationData } = require("../helpers/fn");
// const socket = require("../helpers/socket.helper");
const io = require("socket.io-client");

exports.findAll = async function (req, res) {
  const postData = await Post.findAll(req.body);
  return res.send(postData);
};

exports.getPostByProfileId = async function (req, res) {
  console.log(req.params.id);
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  console.log("in ==>", req.query.startDate, req.query.endDate);
  const postList = await Post.getPostByProfileId(
    req.params.id,
    startDate,
    endDate
  );
  if (postList) {
    res.send({ data: postList });
  }
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
    Post.delete(req.params.id, function (err) {
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

exports.getPostComments = async function (req, res) {
  if (req.params.id) {
    // Post.getPostComments(req.params.id, function (err, comments) {
    //   if (err) {
    //     return utils.send500(res, err);
    //   } else {
    //     res.send({
    //       error: false,
    //       data: comments,
    //     });
    //   }
    // });

    const data = await Post.getPostComments(req.params.id);
    if (data) {
      res.send({
        error: false,
        data: data,
      });
    }
  } else {
    return utils.send404(res, err);
  }
};

exports.deletePostComment = function (req, res) {
  if (req.params.id) {
    Post.deletePostComment(req.params.id, function (err) {
      if (err) {
        return utils.send500(res, err);
      } else {
        res.send({
          error: false,
          message: "Comment deleted sucessfully",
        });
      }
    });
  } else {
    return utils.send404(res, err);
  }
};
exports.deleteAllData = async function (req, res) {
  if (req.params.id) {
    await Post.deleteAllData(req.params.id);
    res.send({
      error: false,
      message: "Data deleted successfully",
    });
  } else {
    return utils.send404(res, err);
  }
};
