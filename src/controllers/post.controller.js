const Post = require("../models/post.model");
const utils = require("../helpers/utils");

exports.findAll = function (req, res) {
  Post.findAll(function (err, post) {
    if (err) return utils.send500(res, err);
    res.send(post);
  });
};
