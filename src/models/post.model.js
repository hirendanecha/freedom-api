var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { getPagination, getPaginationData } = require("../helpers/fn");
const { executeQuery } = require("../helpers/utils");

var Post = function (post) {
  this.postdescription = post.postdescription;
  this.keywords = post.keywords;
  this.posttoprofileid = post.posttoprofileid;
  this.textpostdesc = post.textpostdesc;
  this.imageUrl = post.imageUrl;
  this.posttype = post.posttype || "S";
  this.profileid = post.profileid;
  this.isdeleted = "N";
  this.postcreationdate = new Date();
  this.metalink = post?.metalink;
  this.title = post?.title;
  this.metadescription = post?.metadescription;
};

// Post.findAll = async function (limit, offset, search) {
//   const whereCondition = `${
//     search
//       ? `p.isdeleted ='N' AND p.postdescription !='' AND pr.Username LIKE '%${search}%'`
//       : `p.isdeleted ='N' AND p.postdescription !=''`
//   }`;
//   console.log(whereCondition);
//   const postCount = await executeQuery(
//     `SELECT count(p.id) as count FROM posts as p left join profile as pr on p.profileid = pr.Id WHERE ${whereCondition}`
//   );

//   const postData = await executeQuery(
//     `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where ${whereCondition} order by p.postcreationdate DESC limit ? offset ?`,
//     [limit, offset]
//   );
//   return {
//     count: postCount?.[0]?.count || 0,
//     data: postData,
//   };
// };

Post.findAll = async function (params) {
  const { page, size, profileId, communityId } = params;
  const { limit, offset } = getPagination(page, size);
  const communityCondition = communityId
    ? `p.communityId = ${communityId} AND`
    : "p.communityId IS NULL AND";

  const query = `SELECT p.*, pl.ActionType as react, pr.ProfilePicName, pr.Username, pr.FirstName 
  from 
  posts as p left join postlikedislike as pl on pl.ProfileID = ? and pl.PostID = p.id  left join profile as pr on p.profileid = pr.ID 
  where ${communityCondition}
  p.profileid not in (SELECT UnsubscribeProfileId FROM unsubscribe_profiles where ProfileId = ?) AND p.isdeleted ='N' order by p.profileid in (SELECT SeeFirstProfileId from see_first_profile where ProfileId=?) DESC, p.id DESC limit ? offset ?`;
  const values = [profileId, profileId, profileId, limit, offset];
  const posts = await executeQuery(query, values);

  return getPaginationData({ count: 100, docs: posts }, page, limit);
};

Post.getPostByProfileId = async function (profileId, startDate, endDate) {
  let whereCondition = "";
  if (startDate && endDate) {
    whereCondition += `AND p.postcreationdate >= '${startDate}' AND p.postcreationdate <= '${endDate}'`;
    console.log(whereCondition);
  } else if (startDate) {
    whereCondition += `AND p.postcreationdate >= '${startDate}'`;
  } else if (endDate) {
    whereCondition += `AND p.postcreationdate <= '${endDate}'`;
  }

  const query = `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.isdeleted ='N' and p.profileid =? ${whereCondition} order by p.postcreationdate DESC;`;
  const values = [profileId];
  const postData = await executeQuery(query, values);
  return postData;
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
Post.deleteAllData = async function (id) {
  const query = "delete from comments where profileId = ?";
  const query1 = "delete from posts where profileid = ?";
  const query2 = "delete from communityMembers where profileId = ?";
  const query3 = "delete from community where profileId = ?";
  const query4 = "delete from see_first_profile where profileId = ?";
  const query5 = "delete from unsubscribe_profiles where profileId = ?";
  const values = [id];
  await executeQuery(query, values);
  await executeQuery(query1, values);
  await executeQuery(query2, values);
  await executeQuery(query3, values);
  await executeQuery(query4, values);
  await executeQuery(query5, values);
  return;
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
      ids || null
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
