var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Post = function (post) {
  this.postdescription = post.postdescription;
  this.postdescription = post.postdescription;
};

Post.findAll = function (result) {
  db.query(
    "SELECT * from posts where isdeleted ='N' order by postcreationdate limit 15",
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

module.exports = Post;
