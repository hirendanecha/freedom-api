"use strict";
require("../common/common")();
const { executeQuery } = require("../helpers/utils");
var Messages = function (data) {
  this.messageText = data.messageText;
  this.roomId = data.roomId;
  this.sentBy = data.sentBy;
  this.messageMedia = data.messageMedia;
  this.isRead = data.isRead || "N";
};

Messages.getMessages = async (limit, offset, roomId) => {
  const searchCount = await executeQuery(
    `SELECT count(m.id) as count FROM messages as m WHERE roomId = ${roomId}`
  );
  const searchData = await executeQuery(
    `select * from messages where roomId =${roomId} GROUP BY id order by createdDate limit ? offset ?`,
    [limit, offset]
  );
  return {
    count: searchCount?.[0]?.count || 0,
    messageList: searchData,
  };
};

module.exports = Messages;
