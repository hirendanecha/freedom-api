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

featuredChannels.searchAllData = async (search) => {
  const query = `select * from featured_channels where firstname like '%${search}%' or unique_link like '%${search}%'`;
  const channels = await executeQuery(query);
  const query1 = `select p.* ,pr.Username,pr.ProfilePicName,pr.FirstName,pr.LastName from posts as p left join profile as pr on p.profileid = pr.ID WHERE p.posttype = 'V' and p.isdeleted = "N" and (p.videoduration is not NULL or p.videoduration != 0 or p.videoduration != "0" ) and (p.postdescription like '%${search}%' or p.keywords like '%${search}%' or p.title like '%${search}%') order by p.id desc`;
  console.log("query1: ", query1);
  const value1 = [search, search];
  const posts = await executeQuery(query1);
  //console.log(channels, posts);
  return { channels, posts };
};

featuredChannels.getChannelById = async function (name) {
  const query =
    "select * from featured_channels where profileid = ? or unique_link = ?";
  const value = [name, name];
  const channels = await executeQuery(query, value);
  console.log(channels);
  if (channels) {
    return channels;
  }
};

featuredChannels.getChannelByUserId = async function (id) {
  const query =
    "select f.* from featured_channels as f left join profile as p on p.ID = f.profileid where f.profileid in(p.Id) and p.UserID = ? and feature = 'Y';";
  const value = [id];
  const channels = await executeQuery(query, value);
  console.log(channels);
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
  console.log("oldchannels", oldchannels);
  if (!oldchannels.length) {
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

featuredChannels.getChannelVideos = async function (channelId, limit, offset) {
  const whereCondition = channelId
    ? `p.posttype = 'V' and p.streamname is not null and p.channelId = ${channelId}`
    : "p.posttype = 'V' and p.streamname is not null";
  const searchCount = await executeQuery(
    `SELECT count(id) as count FROM posts as p WHERE ${whereCondition}`
  );
  const query = `select p.*,fc.firstname,fc.unique_link,fc.profile_pic_name,fc.created from posts as p left join featured_channels as fc on fc.id = p.channelId where ${whereCondition} order by postcreationdate desc limit ? offset ? `;
  const values = [limit, offset];
  const posts = await executeQuery(query, values);
  if (posts) {
    return {
      count: searchCount?.[0]?.count || 0,
      data: posts,
    };
  }
};

featuredChannels.getVideos = async function (channelId, limit, offset) {
  const whereCondition = channelId
    ? `p.posttype = 'V' and p.streamname is not null and p.channelId != ${channelId}`
    : "p.posttype = 'V' and p.streamname is not null";
  const searchCount = await executeQuery(
    `SELECT count(id) as count FROM posts as p WHERE ${whereCondition}`
  );
  const query = `select p.*,fc.firstname,fc.unique_link,fc.profile_pic_name,fc.created from posts as p left join featured_channels as fc on fc.id = p.channelId where ${whereCondition} order by postcreationdate desc limit ? offset ? `;
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
