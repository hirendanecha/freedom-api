const Community = require("../models/community.model");
const User = require("../models/user.model");
const utils = require("../helpers/utils");
const { getPagination, getCount, getPaginationData } = require("../helpers/fn");

// Admin Api //
exports.findApproveCommunity = async function (req, res) {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  const count = await getCount("community");
  Community.findApproveCommunity(limit, offset, function (err, community) {
    if (err) return utils.send500(res, err);
    res.send(getPaginationData({ count, docs: community }, page, limit));
  });
};
exports.findUnApproveCommunity = async function (req, res) {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  const count = await getCount("community");
  Community.findUnApproveCommunity(limit, offset, function (err, community) {
    if (err) return utils.send500(res, err);
    res.send(getPaginationData({ count, docs: community }, page, limit));
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
          data: community,
        });
      }
    });
  }
};

exports.approveCommunity = function (req, res) {
  console.log(req.params.id, req.query.IsApprove);
  const communityId = req.params.id;
  Community.approveCommunity(
    communityId,
    req.query.IsApprove,
    function (err, result) {
      if (err) {
        return utils.send500(err, res);
      } else {
        console.log(result);
        res.json({
          error: false,
          message: "Community approve successfully",
        });
      }
    }
  );
};

exports.changeAccountType = function (req, res) {
  if (req.params.id) {
    const userId = req.params.id;
    User.changeAccountType(userId, req.query.type, function (err, res) {
      if (err) {
        return utils.send500(res, err);
      } else {
        return res.send({
          error: false,
          message: "Account type change successfully",
        });
      }
    });
  } else {
    res.status(400).send({ error: true, message: "Error in application" });
  }
};

exports.deleteCommunity = function (req, res) {
  if (req.params.id) {
    Community.deleteCommunity(req.params.id, function (err, res) {
      if (err) return utils.send500(res, err);
      res.json({
        error: false,
        message: "Community deleted successfully",
      });
    });
  }
};

exports.findCommunityById = async function (req, res) {
  if (req.params.id) {
    const community = await Community.findCommunityById(req.params.id);
    if (community) {
      res.send(community);
    } else {
      res.status(400).send({
        error: true,
        message: "Community not found",
      });
    }
  }
};

exports.search = async function (req, res) {
  const { page, size, searchText } = req.query;
  const { limit, offset } = getPagination(page, size);
  const count = await getCount("users");
  const data = await Community.search(searchText, limit, offset);
  return res.send(getPaginationData({ count, docs: data }, page, limit));
};

exports.createCommunityAdmin = function (req, res) {
  const data = { ...req.body };
  Community.createCommunityAdmin(data, function (err, result) {
    if (err) {
      return utils.send500(res, err);
    } else {
      return res.json({
        error: false,
        data: result,
      });
    }
  });
};

// Client Api //

exports.getCommunity = async function (req, res) {
  const userId = req.query.id;
  console.log(userId);
  const communityList = await Community.getCommunity(userId);
  if (!communityList) {
    return utils.send500(err, res);
  } else {
    res.send({
      error: false,
      data: communityList,
    });
  }
};

exports.getCommunityByUserId = async function (req, res) {
  const userId = req.params.id;
  console.log(userId);
  const communityList = await Community.getCommunityByUserId(userId);
  if (!communityList) {
    return utils.send500(err, res);
  } else {
    res.send({
      error: false,
      data: communityList,
    });
  }
};
