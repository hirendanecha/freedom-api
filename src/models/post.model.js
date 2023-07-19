var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Post = function (post) {
  this.postdescription = post.postdescription;
  this.imageUrl = post.imageUrl;
  this.posttype = post.posttype || 'S';
  this.profileid = post.profileid;
  this.isdeleted = 'N';
  this.postcreationdate = new Date();
};

Post.findAll = function (result) {
  db.query(
    // "SELECT * from posts where isdeleted ='N' order by postcreationdate DESC limit 15 ",
    "SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.isdeleted ='N' order by p.postcreationdate DESC limit 15;",
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

module.exports = Post;
