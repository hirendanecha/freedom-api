const { executeQuery } = require("../helpers/utils");
const { notificationMail } = require("../helpers/utils");
const { getPagination, getCount, getPaginationData } = require("../helpers/fn");
const { param } = require("../routes");

exports.getPost = async function (data) {
  return await getPost(data);
};
exports.createPost = function (data) {
  return createNewPost(data);
};
exports.createCommunity = async function (data) {
  return await createCommunity(data);
};
exports.getCommunityPost = async function (data) {
  return await getCommunityPost(data);
};
exports.createCommunityPost = async function (data) {
  return await createCommunityPost(data);
};
exports.getCommunity = async function (data) {
  return await getCommunity(data);
};

exports.getUnApproveCommunity = async function (data) {
  return await getUnApproveCommunity(data);
};

exports.getApproveCommunity = async function (data) {
  return await getApproveCommunity(data);
};

exports.likeFeedPost = async function (data) {
  return await likeFeedPost(data);
};

exports.disLikeFeedPost = async function (data) {
  return await disLikeFeedPost(data);
};

exports.createNotification = async function (data) {
  return await createNotification(data);
};

exports.createComments = async function (data) {
  return await createComments(data);
};

exports.likeFeedComment = async function (data) {
  return await likeFeedComment(data);
};

exports.disLikeFeedComment = async function (data) {
  return await disLikeFeedComment(data);
};

getPost = async function (params) {
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
  // if (posts.length > 0) {
  //   for (const key in posts) {
  //     if (Object.hasOwnProperty.call(posts, key)) {
  //       const post = posts[key];
  //       const query =
  //         "select c.*,pr.ProfilePicName, pr.Username, pr.FirstName from comments as c left join profile as pr on pr.ID = c.profileId where c.postId = ?";
  //       const value = [post.id];
  //       const comment = await executeQuery(query, value);
  //       post.commentList = comment;
  //     }
  //   }
  // }
  return posts;
};

createNewPost = async function (data) {
  console.log("post-data", data);
  const postData = {
    profileid: data?.profileid,
    title: data?.meta?.title,
    metadescription: data?.meta?.metadescription,
    metaimage: data?.meta?.metaimage,
    metalink: data?.meta?.metalink,
    postdescription: data?.postdescription,
    communityId: data?.communityId || null,
    imageUrl: data?.imageUrl,
  };

  postData.postcreationdate = new Date();
  postData.isdeleted = "N";
  postData.posttype = "S";
  const query = data?.id
    ? `update posts set ? where id= ?`
    : `INSERT INTO posts set ?`;
  const values = data?.id ? [postData, data?.id] : [postData];
  const post = await executeQuery(query, values);
  console.log('post : ', post);

  const notifications = [];
  if (post) {
    if (data?.tags?.length > 0) {
      for (const key in data?.tags) {
        if (Object.hasOwnProperty.call(data?.tags, key)) {
          const tag = data?.tags[key];

          const notification = await createNotification({
            notificationToProfileId: tag?.id,
            postId: data?.id || post.insertId,
            notificationByProfileId: postData?.profileid,
            actionType: "T",
          });
          console.log(notification);
          const findUser = `select u.Email,p.FirstName,p.LastName from users as u left join profile as p on p.UserID = u.Id where p.ID = ?`;
          const values = [tag?.id];
          const userData = await executeQuery(findUser, values);
          const findSenderUser = `select p.ID,p.Username from profile as p where p.ID = ?`;
          const values1 = [postData?.profileid];
          const senderData = await executeQuery(findSenderUser, values1);
          notifications.push(notification);
          if (tag?.id) {
            const userDetails = {
              email: userData[0].Email,
              profileId: senderData[0].ID,
              userName: senderData[0].Username,
              firstName: userData[0].FirstName,
              lastName: userData[0].LastName,
            };
            await notificationMail(userDetails);
          }
        }
      }
    }

    const query1 = `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.id=?`;
    const values1 = [data?.id || post.insertId];
    const posts = await executeQuery(query1, values1);
    return { notifications, posts };
  }
};

createCommunity = async function (params) {
  const query = `INSERT INTO community set ?`;
  const values = [data];
  const post = await executeQuery(query, values);
  console.log(post.insertId);
  return post.insertId;
};

createCommunityPost = async function (data) {
  data.createdDate = new Date();
  const query = `INSERT INTO communityPosts set ?`;
  const values = [data];
  const post = await executeQuery(query, values);
  console.log(post.insertId);
  if (post.insertId) {
    const query1 = `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from communityPosts as p left join profile as pr on p.profileId = pr.ID where p.Id=?`;
    const values1 = [post.insertId];
    const posts = await executeQuery(query1, values1);
    return posts;
  }
};

getCommunityPost = async function (params) {
  const { page, size, profileId } = params;
  const { limit, offset } = getPagination(page, size);
  const query = `SELECT p.*,pl.ActionType as react, pr.ProfilePicName, pr.Username, pr.FirstName from communityPosts as p left join postlikedislike as pl on pl.ProfileID = ? and pl.communityPostId = p.Id left join profile as pr on p.profileId = pr.ID order by p.createdDate DESC limit ? offset ?`;
  const values = [profileId, limit, offset];
  const posts = await executeQuery(query, values);
  return posts;
};

getCommunity = async function (params) {
  const { id } = params;
  const query =
    "select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'Y' AND cm.profileId != ? group by c.Id;";
  const communityList = await executeQuery(query, [id]);
  console.log(communityList);
  return communityList;
};

// socket for admin //

getUnApproveCommunity = async function (params) {
  const { page, size } = params;
  const { limit, offset } = getPagination(page, size);
  const query = `select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'N' group by c.Id order by c.creationDate DESC limit ? offset ?`;
  const values = [limit, offset];
  const communitYList = await executeQuery(query, values);
  return communitYList;
};

getApproveCommunity = async function (params) {
  const { page, size } = params;
  const { limit, offset } = getPagination(page, size);
  const query = `select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'Y' group by c.Id order by c.creationDate DESC limit ? offset ?`;
  const values = [limit, offset];
  const communitYList = await executeQuery(query, values);
  return communitYList;
};

likeFeedPost = async function (params) {
  const { postId, communityPostId, profileId, likeCount, actionType } = params;
  if (postId) {
    const query = `update posts set likescount = ? where id =?`;
    const query1 = `INSERT INTO postlikedislike set ?`;
    const values = [likeCount, postId];
    const data = {
      PostID: postId,
      ProfileID: profileId,
      ActionType: actionType,
    };
    const values1 = [data];
    const post = await executeQuery(query, values);
    const likeData = await executeQuery(query1, values1);
    const postData = await getPost({ page: 1, size: 15 });
    return postData;
  } else if (communityPostId) {
    const query = `update communityPosts set likescount = ? where Id =?`;
    const query1 = `INSERT INTO postlikedislike set ?`;
    const values = [likeCount, communityPostId];
    const data = {
      communityPostId: communityPostId,
      ProfileID: profileId,
      ActionType: actionType,
    };
    const values1 = [data];
    const post = await executeQuery(query, values);
    const likeData = await executeQuery(query1, values1);
    const postData = await getCommunityPost({ page: 1, size: 15 });
    return postData;
  }
};

disLikeFeedPost = async function (params) {
  const { postId, communityPostId, profileId, likeCount } = params;
  if (postId) {
    const query = `update posts set likescount = ? where id =?`;
    const query1 = `delete from postlikedislike where PostID = ? AND ProfileID = ?`;
    const values = [likeCount, postId];
    const values1 = [postId, profileId];
    const post = await executeQuery(query, values);
    const likeData = await executeQuery(query1, values1);
    const postData = await getPost({ profileId: profileId, page: 1, size: 15 });
    return postData;
  } else if (communityPostId) {
    const query = `update communityPosts set likescount = ? where id =?`;
    const query1 = `delete from postlikedislike where communityPostId = ? AND ProfileID = ?`;
    const values = [likeCount, communityPostId];
    const values1 = [communityPostId, profileId];
    const post = await executeQuery(query, values);
    const likeData = await executeQuery(query1, values1);
    const postData = await getCommunityPost({
      profileId: profileId,
      page: 1,
      size: 15,
    });
    return postData;
  }
};

createNotification = async function (params) {
  const {
    notificationToProfileId,
    postId,
    notificationByProfileId,
    actionType,
    commentId,
  } = params;
  const query =
    "SELECT ID,ProfilePicName, Username, FirstName,LastName from profile where ID = ?";
  const values = [notificationByProfileId];
  const userData = await executeQuery(query, values);
  let desc = "";
  if (commentId && actionType === "L") {
    desc = `${
      userData[0]?.FirstName || userData[0]?.Username
    } liked your Comment.`;
    console.log("desc===>", desc);
  } else {
    desc =
      actionType === "R"
        ? `${
            userData[0]?.FirstName || userData[0]?.Username
          } replied to your comment`
        : actionType === "C"
        ? `${
            userData[0]?.FirstName || userData[0]?.Username
          } commented on your post`
        : actionType === "T"
        ? `You were tagged in ${
            userData[0]?.FirstName || userData[0]?.Username
          }'s post.`
        : `${userData[0]?.FirstName || userData[0]?.Username} liked your post.`;
  }
  const data = {
    notificationToProfileId: Number(notificationToProfileId),
    postId: postId,
    notificationByProfileId: Number(notificationByProfileId),
    actionType: actionType,
    notificationDesc: desc,
  };
  console.log(data, "==>");
  if (data.notificationByProfileId === data.notificationToProfileId) {
    return true;
  } else {
    const find =
      "select * from notifications where postId= ? and notificationByProfileId = ?";
    const value = [data.postId, data.notificationByProfileId];
    const oldData = await executeQuery(find, value);
    console.log(oldData);
    if (oldData.length) {
      return oldData[0];
    } else {
      const query1 = "insert into notifications set ?";
      const values1 = [data];
      const notificationData = await executeQuery(query1, values1);
      return { ...data, id: notificationData.insertId };
    }
  }
};

createComments = async function (params) {
  const data = {
    postId: params?.postId,
    profileId: params?.profileId,
    comment: params?.comment,
    parentCommentId: params?.parentCommentId,
    imageUrl: params?.imageUrl,
  };
  const query = "insert into comments set ?";
  const values = [data];
  const commentData = await executeQuery(query, values);
  let notifications = [];
  let notification = {};
  if (data.parentCommentId) {
    const query1 = "select profileId from comments where postId= ?";
    const value = [data.postId];
    const comments = await executeQuery(query1, value);
    console.log(comments);
    notification = await createNotification({
      notificationToProfileId: comments[0].profileId,
      postId: data.postId,
      notificationByProfileId: data?.profileId,
      actionType: "R",
    });
  } else {
    const query1 = "select profileid from posts where id= ?";
    const value = [data.postId];
    const posts = await executeQuery(query1, value);
    notification = await createNotification({
      notificationToProfileId: posts[0].profileid,
      postId: data.postId,
      notificationByProfileId: data?.profileId,
      actionType: "C",
    });
  }
  notifications.push(notification);
  console.log(notifications);
  const query3 =
    "select c.*,pr.ProfilePicName, pr.Username, pr.FirstName from comments as c left join profile as pr on pr.ID = c.profileId where c.id = ?";
  const value3 = [commentData.insertId];
  const comments = await executeQuery(query3, value3);
  return { notifications, comments };
};

likeFeedComment = async function (params) {
  const { commentId, profileId, likeCount, actionType } = params;
  const query = `update comments set likeCount = ? where id =?`;
  const query1 = `INSERT INTO commentsLikesDislikes set ?`;
  const values = [likeCount, commentId];
  const data = {
    commentId: commentId,
    profileId: profileId,
    actionType: actionType,
  };
  const values1 = [data];
  const post = await executeQuery(query, values);
  const likeData = await executeQuery(query1, values1);
  const postData = await getPost({ page: 1, size: 15 });
  return postData;
};

disLikeFeedComment = async function (params) {
  const { commentId, profileId, likeCount } = params;
  if (commentId) {
    const query = `update comments set likeCount = ? where id =?`;
    const query1 = `delete from commentsLikesDislikes where commentId = ? AND profileId = ?`;
    const values = [likeCount, commentId];
    const values1 = [commentId, profileId];
    const post = await executeQuery(query, values);
    const likeData = await executeQuery(query1, values1);
    const postData = await getPost({ profileId: profileId, page: 1, size: 15 });
    return postData;
  }
};
