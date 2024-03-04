"use strict";
require("../common/common")();
const { executeQuery } = require("../helpers/utils");
const moment = require("moment");
var Messages = function (data) {
  this.messageText = data.messageText;
  this.roomId = data.roomId;
  this.sentBy = data.sentBy;
  this.messageMedia = data.messageMedia;
  this.isRead = data.isRead || "N";
  this.groupId = data.groupId;
};

Messages.getMessages = async (limit, offset, roomId, groupId) => {
  const searchCount = await executeQuery(
    `SELECT count(m.id) as count FROM messages as m WHERE roomId = ${roomId} or groupId = ${groupId}`
  );
  const searchData = await executeQuery(
    `select m.*,p.Username,p.ProfilePicName,p.FirstName from messages as m left join profile as p on p.ID = m.sentBy where m.roomId =${roomId} or m.groupId = ${groupId} GROUP BY m.id order by m.createdDate desc limit ? offset ?`,
    [limit, offset]
  );
  for (const msg of searchData) {
    msg["parentMessage"] = await getMessageById(msg?.parentMessageId);
    // if (msg.groupId) {
    // }
  }
  const index = searchCount?.[0]?.count;
  console.log(searchData[0]);
  const readBy = await getReadUser(searchData[0]);
  console.log(readBy);
  return {
    count: searchCount?.[0]?.count || 0,
    messageList: searchData,
    readUsers: readBy,
  };
};

Messages.getMembers = async (groupId, searchText) => {
  try {
    const query =
      "select gm.profileId as Id,p.Username,p.FirstName,p.ProfilePicName from groupMembers as gm left join profile as p on p.ID = gm.profileId where gm.groupId = ? and p.Username Like ? order by p.Username";
    const values = [groupId, `${searchText}%`];
    const memberList = await executeQuery(query, values);
    return memberList;
  } catch (error) {
    return error;
  }
};

const getMessageById = async function (id) {
  try {
    const query =
      "select m.*,p.Username,p.ProfilePicName,p.FirstName from messages as m left join profile as p on p.ID = m.sentBy where m.id = ?";
    const values = [id];
    const [message] = await executeQuery(query, values);
    return message;
  } catch (error) {
    return null;
  }
};

const getReadUser = async function (msg) {
  try {
    const date = moment(msg?.createdDate)
      .utc()
      .local()
      .format("YYYY-MM-DD HH:mm:ss");
    const query = `select p.ID,p.Username,p.ProfilePicName,p.FirstName from profile as p left join groupMembers as gm on p.ID = gm.profileId where gm.groupId = ${msg.groupId} and gm.switchDate >= '${date}'`;
    const readUsers = await executeQuery(query);
    return readUsers;
  } catch (error) {
    return null;
  }
};

module.exports = Messages;
