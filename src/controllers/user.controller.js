"use strict";

const User = require("../models/user.model");
const utils = require("../helpers/utils");
const environments = require("../environments/environment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { getPagination, getCount, getPaginationData } = require("../helpers/fn");

exports.login = async function (req, res) {
  console.log("jkfhguysdhfgbdf");
  const { email, password } = req.body;
  const user = await User.findByUsernameAndEmail(email);
  // console.log(user);
  if (user) {
    const encryptedPassword = Encrypt(password);
    const isMatch = encryptedPassword === user.Password;
    console.log(isMatch);
    if (isMatch) {
      User.login(email, user.Id, function (err, token) {
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
        .send({ error: true, message: "Password is incorrect" });
    }
    // bcrypt.compare(password, user.Password, (error, isMatch) => {
    //   if (error) {
    //     console.log(error);
    //     return res.status(400).send({ error: true, message: error });
    //   }
    //   console.log(isMatch);
    //   if (isMatch) {
    //     User.login(email, user.Id, function (err, token) {
    //       if (err) {
    //         console.log(err);
    //         if (err?.errorCode) {
    //           return res.status(400).send({
    //             error: true,
    //             message: err?.message,
    //             errorCode: err?.errorCode,
    //           });
    //         }
    //         return res.status(400).send({ error: true, message: err });
    //       } else {
    //         return res.json(token);
    //       }
    //     });
    //   } else {
    //     return res
    //       .status(400)
    //       .send({ error: true, message: "Password not matched!" });
    //   }
    // });
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
    const oldUser = await User.findByEmail(user.Email);
    const oldUserName = await User.findByUsername(user.Username);
    console.log(oldUserName);
    if (!oldUserName) {
      if (!oldUser) {
        // const encryptedPassword = await bcrypt.hash(user.Password, 10);
        const encryptedPassword = Encrypt(user.Password);
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
      } else {
        return res.status(400).send({
          error: true,
          message: "End user already exist, please enter a different email",
        });
      }
    } else {
      return res.status(400).send({
        error: true,
        message: "End user already exist, please enter a different username",
      });
    }
  }
};

exports.findAll = async (req, res) => {
  const { page, size, search } = req.query;
  const { limit, offset } = getPagination(page, size);

  const searchCountData = await User.findAndSearchAll(limit, offset, search);
  return res.send(
    getPaginationData(
      { count: searchCountData.count, docs: searchCountData.data },
      page,
      limit
    )
  );
};

exports.getAll = async function (req, res) {
  // User.getAll(function (err, users) {
  //   if (err) return utils.send500(res, err);
  //   res.send(users);
  // });
  const Users = await User.getAll();
  res.send({
    error: false,
    data: Users,
  });
};

exports.getUserList = function (req, res) {
  User.getUserList(req.params.id, function (err, user) {
    if (err) return utils.send500(res, err);
    res.send(user);
  });
};

exports.findById = async function (req, res) {
  const user = await User.findById(req.params.id);
  if (user) {
    res.send(user);
  } else {
    res.status(400).send({
      error: true,
      message: "User not found",
    });
  }
  // , function (err, user) {
  //   if (err) return utils.send500(res, err);
  //   res.send(user);
  // });
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

exports.setPassword = async function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const token = req.body.token;
    const newPassword = req.body.password;
    let jwtSecretKey = environments.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, jwtSecretKey);
    if (decoded) {
      const user = await User.findById(decoded.userId, res);
      console.log("user=>", user);
      if (user) {
        const encryptedPassword = Encrypt(newPassword);
        // const encryptedPassword = await bcrypt.hash(newPassword, 10);
        User.setPassword(decoded.userId, encryptedPassword);
        res.json({ error: false, message: "success" });
      }
    } else {
      res.json({ error: true, message: "Error occurred" });
    }
  }
};

// exports.setPassword = async function (req, res) {
//   if (Object.keys(req.body).length === 0) {
//     res.status(400).send({ error: true, message: "Error in application" });
//   } else {
//     const email = req.body.email;
//     const newPassword = req.body.password;
//     const encryptedPassword = await bcrypt.hash(newPassword, 10);
//     console.log(email, newPassword, encryptedPassword);
//     // newPassword = encryptedPassword;
//     // let jwtSecretKey = environments.JWT_SECRET_KEY;
//     // const decoded = jwt.verify(token, jwtSecretKey);
//     if (email) {
//       User.setPassword(email, encryptedPassword);
//       res.json({
//         error: false,
//         message: "password update successfully, please login",
//       });
//     } else {
//       res.json({ error: true, message: "Error occurred" });
//     }
//   }
// };

exports.forgotPassword = async function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const email = req.body.email;
    const user = await User.findByEmail(email);
    if (user) {
      const data = await utils.forgotPasswordMail(user);
      if (data.messageId) {
        return res.json({
          error: false,
          message: "please check your mail for reset password",
        });
      } else {
        return res.json({ error: "error", message: data.error });
      }
    }
  }
};

exports.changeActiveStatus = function (req, res) {
  console.log(req.params.id, req.query.IsActive);
  User.changeStatus(req.params.id, req.query.IsActive, function (err, result) {
    if (err) {
      return utils.send500(res, err);
    } else {
      res.json({ error: false, message: "User status changed successfully" });
    }
  });
};
exports.userSuspend = function (req, res) {
  console.log(req.params.id, req.query.IsSuspended);
  User.suspendUser(
    req.params.id,
    req.query.IsSuspended,
    function (err, result) {
      if (err) {
        return utils.send500(res, err);
      } else {
        res.json({
          error: false,
          message:
            req.query.IsSuspended === "Y"
              ? "User suspend successfully"
              : "User unsuspend successfully",
        });
      }
    }
  );
};

exports.activateMedia = function (req, res) {
  console.log(req.params.id, req.query.IsSuspended);
  User.activateMedia(
    req.params.id,
    req.query.MediaApproved,
    function (err, result) {
      if (err) {
        return utils.send500(res, err);
      } else {
        res.json({
          error: false,
          message:
            req.query.MediaApproved === 0
              ? "Activate media successfully"
              : "De-activate media successfully",
        });
      }
    }
  );
};

exports.delete = function (req, res) {
  console.log(req.params.id);
  const isdeleted = User.delete(req.params.id);
  if (isdeleted) {
    res.json({ error: false, message: "User deleted successfully" });
  }
};

exports.adminLogin = async function (req, res) {
  console.log("jkfhguysdhfgbdf");
  const { email, password } = req.body;
  const user = await User.findByUsernameAndEmail(email);
  console.log(user);
  if (user) {
    const encryptedPassword = Encrypt(password);
    const isMatch = encryptedPassword === user.Password;
    console.log(isMatch);
    if (isMatch) {
      User.adminLogin(email, function (err, token) {
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
        .send({ error: true, message: "Password is incorrect" });
    }
  } else {
    return res.status(400).send({ error: true, message: "User not found" });
  }
};

exports.changeAccountType = function (req, res) {
  if (req.params.id) {
    const userId = req.params.id;
    User.changeAccountType(userId, req.query.type, function (err, result) {
      if (err) {
        return utils.send500(res, err);
      } else {
        res.send({
          error: false,
          message: "Account type change successfully",
        });
      }
    });
  } else {
    res.status(400).send({ error: true, message: "Error in application" });
  }
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

function Encrypt(strToEncrypt) {
  const encryptionKey = environments.EncryptionKey; // Assuming you have set EncryptionKey as an environment variable

  try {
    const clearBytes = Buffer.from(strToEncrypt, "utf16le");
    const salt = Buffer.from([
      0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65,
      0x76,
    ]);

    const key = crypto.pbkdf2Sync(encryptionKey, salt, 10000, 32, "sha1");
    const iv = crypto.pbkdf2Sync(encryptionKey, salt, 10000, 16, "sha1");

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(clearBytes, "utf8", "base64");
    encrypted += cipher.final("base64");

    return encrypted;
  } catch (ex) {
    return "-99";
  }
}

function Decrypt(strToDecrypt) {
  const encryptionKey = environments.EncryptionKey; // Assuming you have set EncryptionKey as an environment variable

  try {
    strToDecrypt = strToDecrypt.replace(/\s/g, "+"); // Replace spaces with '+' in the input string
    const cipherBytes = Buffer.from(strToDecrypt, "base64");

    const salt = Buffer.from([
      0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65,
      0x76,
    ]);

    const key = crypto.pbkdf2Sync(encryptionKey, salt, 10000, 32, "sha1");
    const iv = crypto.pbkdf2Sync(encryptionKey, salt, 10000, 16, "sha1");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(cipherBytes, "binary", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (ex) {
    return "-99";
  }
}
