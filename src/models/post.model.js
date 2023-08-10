var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Post = function (post) {
  this.postdescription = post.postdescription;
  this.imageUrl = post.imageUrl;
  this.posttype = post.posttype || "S";
  this.profileid = post.profileid;
  this.isdeleted = "N";
  this.postcreationdate = new Date();
};

Post.findAll = async function (limit, offset, result) {
  db.query(
    "SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.isdeleted ='N' order by p.postcreationdate DESC limit ? offset ?",
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

Post.getPostById = function (profileId, result) {
  db.query(
    // "SELECT * from posts where isdeleted ='N' order by postcreationdate DESC limit 15 ",
    "SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.isdeleted ='N' and p.profileid =? order by p.postcreationdate DESC limit 15;",
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

Post.create = function (postData, result) {
  db.query("INSERT INTO posts set ?", postData, function (err, res) {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Post.delete = function (id, result) {
  db.query("DELETE FROM posts WHERE id = ?", [id], function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      console.log("Post deleted", res);
      result(null, res);
    }
  });
};

module.exports = Post;
