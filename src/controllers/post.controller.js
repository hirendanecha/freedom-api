const Post = require("../models/post.model");
const utils = require("../helpers/utils");
const og = require("open-graph");

exports.findAll = function (req, res) {
  Post.findAll(function (err, post) {
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
  og(url, function (err, meta) {
    if (err) {
      return utils.send500(res, err);
    } else {
      return res.json({
        error: false,
        mesage: "Post created",
        data: meta.image,
      });
    }
  });
};
