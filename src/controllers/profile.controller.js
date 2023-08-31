const Profile = require("../models/profile.model");
const utils = require("../helpers/utils");
const environments = require("../environments/environment");
const { getPagination, getCount, getPaginationData } = require("../helpers/fn");

exports.create = function (req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    // console.log(req.body);
    const profile = new Profile({ ...req.body });
    Profile.create(profile, async function (err, profile) {
      if (err) return utils.send500(res, err);
      return res.json({
        error: false,
        message: "Data saved successfully",
        data: profile,
      });
    });
  }
};

exports.FindProfieById = function (req, res) {
  if (req.params.id) {
    const id = req.params.id;
    console.log(id);
    Profile.FindById(id, async function (err, profile) {
      if (err) {
        console.log(err);
        return utils.send500(res, err);
      } else {
        return res.json({ data: profile, error: false });
      }
    });
  }
};

exports.updateProfile = function (req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const profileId = req.params.id;
    const profile = new Profile({ ...req.body });
    Profile.update(profileId, profile, async function (err, profile) {
      if (err) return utils.send500(res, err);
      return res.json({
        error: false,
        message: "Profile update successfully",
        data: profile,
      });
    });
  }
};

exports.getUsersByUsername = async function (req, res) {
  const { searchText } = req.query;
  const data = await Profile.getUsersByUsername(searchText);
  return res.send({
    error: false,
    data: data,
  });
};

exports.editNotifications = async function (req, res) {
  const { id } = req.params;
  const { isRead } = req.query;
  Profile.editNotifications(id, isRead, function (err) {
    if (err) return utils.send500(res, err);
    res.json({ error: false, message: "Notification updated successfully" });
  });
};

exports.getNotificationById = async function (req, res) {
  const { id } = req.params;
  const data = await Profile.getNotificationById(id);
  return res.send({
    error: false,
    data: data,
  });
};

exports.deleteNotification = function (req, res) {
  Profile.deleteNotification(req.params.id, function (err, result) {
    if (err) return utils.send500(res, err);
    res.json({ error: false, message: "Notification deleted successfully" });
  });
};
