const Message = require("../models/message.model");
const utils = require("../helpers/utils");
const { getPagination, getCount, getPaginationData } = require("../helpers/fn");

exports.getMessages = async (req, res) => {
  const { page, size, roomId } = req.body;
  const { limit, offset } = getPagination(page, size);
  const data = await Message.getMessages(limit, offset, roomId);
  return res.send(
    getPaginationData(
      { count: data.count, docs: data.messageList },
      page,
      limit
    )
  );
};
