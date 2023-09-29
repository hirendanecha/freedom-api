"use strict";
var db = require("../../config/db.config");
require("../common/common")();
const { executeQuery } = require("../helpers/utils");

var featuredChannels = function (data) {
  this.profileid = data.profileid;
  this.feature = data.feature;
  this.firstname = data.firstname;
  this.unique_link = data.unique_link;
  this.profile_pic_name = data.profile_pic_name;
  this.created = new Date();
};

featuredChannels.getChannels = async function () {
  const query = "select * from featured_channels";
  const channels = await executeQuery(query);
  if (channels) {
    return channels;
  }
};

featuredChannels.approveChannels = async function (id, feature) {
  const query = "update featured_channels set feature = ? where id =?";
  const values = [feature, id];
  const channels = await executeQuery(query, values);
  if (channels) {
    return channels;
  }
};

featuredChannels.createChannel = async function (reqBody) {
  const query = "insert into featured_channels set ?";
  const values = [reqBody];
  const channels = await executeQuery(query, values);
  if (channels) {
    return channels;
  }
};

featuredChannels.getVideos = async function (profileId, limit, offset) {
  const searchCount = await executeQuery(
    `SELECT count(id) as count FROM posts WHERE posttype = 'V' and isdeleted = 'N' and profileid = ${profileId}`
  );
  const query =
    "select * from posts where posttype = 'V' and isdeleted = 'N' and profileid = ? limit ? offset ? ";
  const values = [profileId, limit, offset];
  const posts = await executeQuery(query, values);
  if (posts) {
    return {
      count: searchCount?.[0]?.count || 0,
      data: posts,
    };
  }
};

module.exports = featuredChannels;
