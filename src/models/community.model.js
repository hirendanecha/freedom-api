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

Community.findApproveCommunity = function (limit, offset, result) {
  db.query(
    "select * from community where isApprove='Y' order by creationDate desc limit ? offset ?",
    [limit, offset],
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};
Community.findUnApproveCommunity = function (limit, offset, result) {
  db.query(
    "select * from community where isApprove='N' order by creationDate desc limit ? offset ?",
    [limit, offset],
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
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

Community.approveCommunity = function (communityId, IsApprove, result) {
  db.query(
    "UPDATE community SET isApprove=? where Id=?",
    [IsApprove, communityId],
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Community.deleteCommunity = function (id, result) {
  db.query("delete from community where Id=?", id, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Community.findCommunityById = async function (id, result) {
  const query =
    "select c.*,u.Username,u.Email from community as c left join users as u on u.Id = c.userId where c.Id=?";
  const values = [id];
  const community = await executeQuery(query, values);
  return community;
};
module.exports = Community;
