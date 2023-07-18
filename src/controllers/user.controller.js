"use strict";

const User = require("../models/user.model");
const utils = require("../helpers/utils");
const environments = require("../environments/environment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async function (req, res) {
  console.log("jkfhguysdhfgbdf");
  const { username, password } = req.body;
  const user = await User.findByEmail(username);
  console.log(user);
  if (user) {
    bcrypt.compare(password, user.Password, (error, isMatch) => {
      if (error) {
        console.log(error);
        return res.status(400).send({ error: true, message: error });
      }
      console.log(isMatch);
      if (isMatch) {
        User.login(username, user.Id, function (err, token) {
          if (err) {
            console.log(err);
            if (err?.errorCode) {
              return res.status(400).send({
                error: true,
                message: err?.message,
                errorCode: err?.errorCode,
              });
            }
            return res.status(400).send({ error: true, message: err });
          } else {
            return res.json(token);
          }
        });
      } else {
        return res
          .status(400)
          .send({ error: true, message: "Password not matched!" });
      }
    });
  } else {
    return res.status(400).send({ error: true, message: "User not found" });
  }
};

exports.create = async function (req, res) {
  // console.log(req.body);
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const user = new User({ ...req.body });
    const encryptedPassword = await bcrypt.hash(user.Password, 10);
    user.Password = encryptedPassword;
    User.create(user, async function (err, user) {
      if (err) return utils.send500(res, err);
      await utils.registrationMail({ ...req.body }, user);
      return res.json({
        error: false,
        message: "Data saved successfully",
        data: user,
      });
    });
  }
};

exports.findAll = function (req, res) {
  User.findAll(function (err, user) {
    if (err) return utils.send500(res, err);
    res.send(user);
  });
};

exports.getUserList = function (req, res) {
  User.getUserList(req.params.id, function (err, user) {
    if (err) return utils.send500(res, err);
    res.send(user);
  });
};

exports.findById = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) return utils.send500(res, err);
    res.send(user);
  });
};

exports.update = function (req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const userToUpdate = new User(req.body);
    // console.log(req.params.id, userToUpdate);
    User.update(req.params.id, userToUpdate, function (err, result) {
      if (err) return utils.send500(res, err);
      res.json({
        error: false,
        message: "User update successfully",
      });
    });
  }
};

exports.setPassword = function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const userId = req.body.userId;
    const newPassword = req.body.password;
    // let jwtSecretKey = environments.JWT_SECRET_KEY;
    // const decoded = jwt.verify(token, jwtSecretKey);
    if (userId) {
      User.setPassword(userId, newPassword);
      res.json({ error: false, message: "success" });
    } else {
      res.json({ error: true, message: "Error occurred" });
    }
  }
};

exports.forgotPassword = async function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const username = req.body.username;
    const user = await User.findByEmail(username);
    if (user) {
      const data = await utils.forgotPasswordMail(user);
      if (data.messageId) {
        return res.json({ error: false, message: "success" });
      } else {
        return res.json({ error: "error", message: data.error });
      }
    }
  }
};

exports.delete = function (req, res) {
  User.delete(req.params.id, function (err, result) {
    if (err) return utils.send500(res, err);
    res.json({ error: false, message: "User deleted" });
  });
};

// ------------------- Zip Data ------------------

exports.getZipData = function (req, res) {
  User.getZipData(req.params.zip, req.query.country, function (err, data) {
    if (err) return utils.send500(res, err);
    res.send(data);
  });
};

exports.getZipCountries = function (req, res) {
  User.getZipCountries(function (err, data) {
    if (err) return utils.send500(res, err);
    res.send(data);
  });
};

exports.verification = function (req, res) {
  User.verification(req.params.token, function (err, data) {
    if (err) {
      if (err?.name === "TokenExpiredError" && data?.userId) {
        return res.redirect(
          `${
            environments.FRONTEND_URL
          }/user/verification-expired?user=${encodeURIComponent(data.email)}`
        );
      }
      return utils.send500(res, err);
    }
    // console.log(data);
    // if (data.IsAdmin === "Y") {
    //   return res.redirect(`${environments.ADMIN_URL}/auth/partner-login`);
    // }
    return res.redirect(`${environments.FRONTEND_URL}/login?isVerify=true`);
  });
};

exports.resendVerification = function (req, res) {
  if (Object.keys(req.body).length === 0 || !req.body?.email?.trim()) {
    return res
      .status(400)
      .send({ error: true, message: "No valid email is given." });
  }
  User.resendVerification(req.body?.email?.trim(), async function (err, data) {
    if (err) return utils.send500(res, err);
    if (data.IsAdmin === "Y") {
      await utils.partnerRegistrationMail({ ...data }, data?.user_id);
    } else {
      await utils.registrationMail({ ...data }, data?.user_id);
    }
    return res.json({
      error: false,
      message: "Verification mail sent successfully.",
    });
  });
};

exports.search = async function (req, res) {
  const data = await User.search(req.query);
  return res.send(data);
};
