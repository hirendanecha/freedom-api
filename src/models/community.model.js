var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Community = function (community) {
  this.userId = community.userId;
  this.communityName = community.CommunityName;
  this.communityDescription = community.CommunityDescription;
  this.logoImg = community.logoImg;
  this.coverImg = community.coverImg;
  this.isApprove = community.isApprove || "N";
  this.creationDate = new Date();
};

Community.findAll = function (result) {
  db.query("select * from community where isApprove='Y'", function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Community.create = function (communityData, result) {
  db.query("INSERT INTO community set ?", communityData, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Community.approveCommunity = function (communityId, result) {
  db.query(
    "UPDATE community SET isApprove='Y' where Id=?",
    communityId,
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};
module.exports = Community;
