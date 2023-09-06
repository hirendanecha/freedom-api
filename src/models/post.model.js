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
  this.metalink = post?.metalink;
  this.tittle = post?.tittle;
  this.metadescription = post?.metadescription;
};

Post.findAll = async function (limit, offset, search) {
  const whereCondition = `${
    search
      ? `p.isdeleted ='N' AND p.postdescription !='' AND pr.Username LIKE '%${search}%'`
      : `p.isdeleted ='N' AND p.postdescription !=''`
  }`;
  console.log(whereCondition);
  const postCount = await executeQuery(
    `SELECT count(p.id) as count FROM posts as p left join profile as pr on p.profileid = pr.Id WHERE ${whereCondition}`
  );

  const postData = await executeQuery(
    `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where ${whereCondition} order by p.postcreationdate DESC limit ? offset ?`,
    [limit, offset]
  );
  return {
    count: postCount?.[0]?.count || 0,
    data: postData,
  };
};

Post.getPostByProfileId = function (profileId, result) {
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
Post.getPostByPostId = function (profileId, result) {
  db.query(
    // "SELECT * from posts where isdeleted ='N' order by postcreationdate DESC limit 15 ",
    "SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.isdeleted ='N' and p.id =? ;",
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
      console.log("Post deleted sucessfully", res);
      result(null, res);
    }
  });
};

Post.deletePostComment = function (id, result) {
  db.query("DELETE FROM comments WHERE id = ?", [id], function (err, res) {
    if (err) {
      console.log("error", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Post.getPostComments = async function (id) {
  // db.query(
  //   "select c.*,pr.ProfilePicName, pr.Username, pr.FirstName from comments as c left join profile as pr on pr.ID = c.profileId where c.postId = ?",
  //   [id],
  //   function (err, res) {
  //     if (err) {
  //       console.log("error", err);
  //       result(err, null);
  //     } else {
  //       result(null, res);
  //     }
  //   }
  // );

  const query =
    "select c.*,pr.ProfilePicName,pr.Username, pr.FirstName, cl.actionType as react from comments as c left join commentsLikesDislikes as cl on cl.commentId = c.id left join profile as pr on pr.ID = c.profileId where c.postId = ? and c.parentCommentId is NULL";
  const values = [id];
  const commmentsList = await executeQuery(query, values);
  if (commmentsList.length >= 0) {
    const ids = commmentsList.map((ele) => Number(ele.id)).join(",");
    console.log(ids);
    const query = `select c.*,pr.ProfilePicName, pr.Username, pr.FirstName, cl.actionType as react from comments as c left join commentsLikesDislikes as cl on cl.commentId = c.id left join profile as pr on pr.ID = c.profileId where c.parentCommentId in (${
      ids || NULL
    })`;
    const replyCommnetsList = await executeQuery(query);
    return { commmentsList, replyCommnetsList };
  } else {
    return null;
  }
};

Post.editPost = async function (post) {
  const query = "update posts set ? where id = ?";
  const values = [post, post.id];
  const postData = await executeQuery(query, values);
};

module.exports = Post;
