const { executeQuery } = require("../helpers/utils");
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

getPost = async function (params) {
  const { page, size } = params;
  const { limit, offset } = getPagination(page, size);
  const query = `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.isdeleted ='N' order by p.postcreationdate DESC limit ? offset ?`;
  const values = [limit, offset];
  const posts = await executeQuery(query, values);
  return posts;
};

createNewPost = async function (data) {
  data.postcreationdate = new Date();
  data.isdeleted = "N";
  const query = `INSERT INTO posts set ?`;
  const values = [data];
  const post = await executeQuery(query, values);
  console.log(post.insertId);
  if (post.insertId) {
    const query1 = `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from posts as p left join profile as pr on p.profileid = pr.ID where p.id=?`;
    const values1 = [post.insertId];
    const posts = await executeQuery(query1, values1);
    return posts;
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
  const { page, size } = params;
  const { limit, offset } = getPagination(page, size);
  const query = `SELECT p.*, pr.ProfilePicName, pr.Username, pr.FirstName from communityPosts as p left join profile as pr on p.profileId = pr.ID order by p.createdDate DESC limit ? offset ?`;
  const values = [limit, offset];
  const posts = await executeQuery(query, values);
  return posts;
};

getCommunity = async function (params) {
  const { id } = params;
  const query = `select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'Y' AND cm.profileId != ? group by c.Id`;
  const values = [id];
  const communitYList = await executeQuery(query, values);
  return communitYList;
};
