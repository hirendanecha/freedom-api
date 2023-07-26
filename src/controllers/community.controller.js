const Community = require("../models/community.model");
const User = require("../models/user.model");
const utils = require("../helpers/utils");

exports.findAll = function (req, res) {
  Community.findAll(function (err, community) {
    if (err) return utils.send500(res, err);
    res.send(community);
  });
};

exports.createCommunity = function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const communityData = new Community(req.body);
    console.log(communityData);
    Community.create(communityData, function (err, community) {
      if (err) {
        return utils.send500(res, err);
      } else {
        return res.json({
          error: false,
          message: "community created",
        });
      }
    });
  }
};

exports.approveCommunity = function (req, res) {
  if (req.params.id) {
    const communityId = req.params.id;
    Community.approveCommunity(communityId, function (err, res) {
      if (err) {
        return utils.send500(res, err);
      } else {
        return res.json({
          error: false,
          message: "Community approve successfully",
        });
      }
    });
  } else {
    res.status(400).send({ error: true, message: "Error in application" });
  }
};

exports.changeAccountType = function (req, res) {
  if (req.params.id) {
    const userId = req.params.id;
    User.changeAccountType(userId, function (err, res) {
      if (err) {
        return utils.send500(res, err);
      } else {
        return res.json({
          error: false,
          message: "success",
        });
      }
    });
  } else {
    res.status(400).send({ error: true, message: "Error in application" });
  }
};
