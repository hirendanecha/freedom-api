const featuredChannels = require("../models/featuredChannels.model");
const utils = require("../helpers/utils");
const { getPagination, getPaginationData } = require("../helpers/fn");

exports.getChannels = async function (req, res) {
  const data = await featuredChannels.getChannels();
  if (data) {
    res.send({ data });
  } else {
    utils.send404(res, (err = { message: "data not found" }));
  }
};

exports.channelsApprove = async function (req, res) {
  const { id, feature } = req.query;
  console.log(id, feature);
  const channel = await featuredChannels.approveChannels(id, feature);
  console.log(channel);
  if (feature === "Y") {
    res.send({
      error: false,
      message: "Channel activate successfully",
    });
  } else {
    res.send({
      error: false,
      message: "Channel de-activate successfully",
    });
  }
};

exports.createChannel = async function (req, res) {
  const data = new featuredChannels({ ...req.body });
  if (data) {
    const newChannel = await featuredChannels.createChannel(data);
    console.log(newChannel);
    if (newChannel) {
      res.send({
        error: false,
        data: newChannel.insertId,
      });
    }
  } else {
    utils.send404(res, (err = { message: "data not found" }));
  }
};

exports.getVideos = async function (req, res) {
  const { id } = req.params;
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  const posts = await featuredChannels.getVideos(id, limit, offset);
  if (posts.data) {
    res.send(
      getPaginationData({ count: posts.count, docs: posts.data }, page, limit)
    );
  } else {
    utils.send500(res, (err = { message: "data not found" }));
  }
};