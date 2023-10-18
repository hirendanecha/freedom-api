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
  const query = "select * from featured_channels where feature = 'Y'";
  const channels = await executeQuery(query);
  if (channels) {
    return channels;
  }
};

featuredChannels.getAllChannels = async (
  limit,
  offset,
  search,
  startDate,
  endDate
) => {
  let whereCondition = "";
  if (search) {
    whereCondition += `${search ? `WHERE f.firstname LIKE '%${search}%'` : ""}`;
  }
  if (startDate && endDate) {
    whereCondition += `${
      search ? `AND` : "WHERE"
    } f.created >= '${startDate}' AND f.created <= '${endDate}'`;
  } else if (startDate) {
    whereCondition += `${search ? `AND` : "WHERE"} f.created >= '${startDate}'`;
  } else if (endDate) {
    whereCondition += `${search ? `AND` : "WHERE"} f.created <= '${endDate}'`;
  }
  const searchCount = await executeQuery(
    `SELECT count(id) as count FROM featured_channels as f`
  );
  const searchData = await executeQuery(
    `SELECT f.*,p.ID as profileId,p.ProfilePicName,p.Username,p.UserID,p.FirstName,p.LastName FROM featured_channels as f left join profile as p on p.ID = f.profileid ${whereCondition} order by f.created desc limit ? offset ?`,
    [limit, offset]
  );

  return {
    count: searchCount?.[0]?.count || 0,
    data: searchData,
  };
};

featuredChannels.getChannelById = async function (name) {
  const query =
    "select * from featured_channels where Id = ? or unique_link = ?";
  const value = [name, name];
  const channels = await executeQuery(query, value);
  if (channels) {
    return channels;
  }
};
featuredChannels.getPostDetails = async function (id) {
  const query =
    "select p.*,fc.firstname,fc.unique_link,fc.profile_pic_name,fc.created,fc.id as channelId from posts as p left join featured_channels as fc on fc.profileid = p.profileid where p.id = ?";
  const values = [id];
  const channels = await executeQuery(query, values);
  console.log(channels);
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
  const query1 = "select * from featured_channels where unique_link = ?";
  const value = [reqBody.unique_link];
  const oldchannels = await executeQuery(query1, value);
  if (!oldchannels) {
    const query = "insert into featured_channels set ?";
    const values = [reqBody];
    const channels = await executeQuery(query, values);
    if (channels) {
      return channels;
    }
  } else {
    return [];
  }
};

featuredChannels.getVideos = async function (profileId, limit, offset) {
  const whereCondition = profileId
    ? `p.posttype = 'V' and p.streamname is not null and p.profileid = ${profileId}`
    : "p.posttype = 'V' and p.streamname is not null";
  const searchCount = await executeQuery(
    `SELECT count(id) as count FROM posts as p WHERE ${whereCondition}`
  );
  const query = `select p.*,fc.firstname,fc.unique_link,fc.profile_pic_name,fc.created,fc.id as channelId from posts as p left join featured_channels as fc on fc.profileid = p.profileid where ${whereCondition} order by postcreationdate desc limit ? offset ? `;
  const values = [limit, offset];
  const posts = await executeQuery(query, values);
  if (posts) {
    return {
      count: searchCount?.[0]?.count || 0,
      data: posts,
    };
  }
};

featuredChannels.deleteChannel = async function (id) {
  const query = "delete from featured_channels where id = ?";
  const value = [id];
  const channels = await executeQuery(query, value);
  if (channels) {
    return channels;
  }
};

featuredChannels.updateChannleFeature = function (feature, id, result) {
  db.query(
    "update featured_channels set feature = ? where id = ?",
    [id, feature],
    function (err, res) {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    }
  );
};

module.exports = featuredChannels;
