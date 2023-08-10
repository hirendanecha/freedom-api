var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var CommunityPost = function (post) {
  this.description = post.description;
  this.imageUrl = post.imageUrl;
  this.postType = post.posttype || "S";
  this.profileid = post.profileid;
  this.communityId = post.communityId;
  this.createdDate = new Date();
};

CommunityPost.findAll = function (limit, offset, result) {
  db.query(
    "SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from communityPosts as p left join profile as pr on p.profileId = pr.ID order by p.createdDate DESC limit ? offset ?",
    [limit, offset],
    function (err, res) {
      if (err) {
        console.log("error", err);
        result(err, null);
      } else {
        // console.log("post: ", res);
        result(null, res);
      }
    }
  );
};

CommunityPost.getCommunityPostById = function (profileId, result) {
  db.query(
    // "SELECT * from posts where isdeleted ='N' order by postcreationdate DESC limit 15 ",
    "SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from communityPosts as p left join profile as pr on p.profileid = pr.ID where p.communityId =? order by p.createdDate DESC limit 15;",
    profileId,
    function (err, res) {
      if (err) {
        console.log("error", err);
        result(err, null);
      } else {
        // console.log("post: ", res);
        result(null, res);
      }
    }
  );
};

CommunityPost.create = function (postData, result) {
  db.query("INSERT INTO communityPostsset ?", postData, function (err, res) {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

module.exports = CommunityPost;
