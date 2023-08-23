const environment = require("../environments/environment");
const email = require("./email");
const jwt = require("jsonwebtoken");
const __upload_dir = environment.UPLOAD_DIR;
var fs = require("fs");
const db = require("../../config/db.config");

exports.send404 = function (res, err) {
  res.status(404).send({ error: true, message: err });
};

exports.send500 = function (res, err) {
  res.status(500).send({ error: true, message: err });
};

exports.isWithinRange = function (text, min, max) {
  // check if text is between min and max length
};

exports.getactualfilename = (fname, folder, id) => {
  var fileName = fname;
  const dir = __upload_dir + "/" + folder + "/" + id;
  console.log(dir);
  let files = fs.readdirSync(dir);
  if (files && files.length > 0) {
    files.forEach((file) => {
      console.log("file >> ", file);
      if (fileName.indexOf(file.split(".")[0]) !== -1) {
        fileName = file;
      }
    });
  }

  return [dir, fileName];
};

exports.registrationMail = async (userData, userId) => {
  let jwtSecretKey = environment.JWT_SECRET_KEY;
  let name = userData.FirstName + " " + userData.LastName;

  const token = jwt.sign(
    {
      userId: userId,
      email: userData.Email,
    },
    jwtSecretKey,
    { expiresIn: "730 days" }
  );

  let registerUrl = `${environment.API_URL}customers/user/verification/${token}`;

  const mailObj = {
    email: userData.Email,
    subject: "Registration",
    root: "../email-templates/registration.ejs",
    templateData: { name: name, url: registerUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.partnerRegistrationMail = async (userData, userId) => {
  let jwtSecretKey = environment.JWT_SECRET_KEY;
  let name = userData.user_full_name;

  const token = jwt.sign(
    {
      userId: userId,
      email: userData.Email,
    },
    jwtSecretKey,
    { expiresIn: "730 days" }
  );

  let registerUrl = `${environment.API_URL}customers/user/verification/${token}`;

  const mailObj = {
    email: userData.Username,
    subject: "freedom.social Registration",
    root: "../email-templates/partner-registration.ejs",
    templateData: { name: name, url: registerUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.forgotPasswordMail = async (user) => {
  console.log(user);
  if (user) {
    let jwtSecretKey = environment.JWT_SECRET_KEY;
    let name = user?.FirstName + " " + user?.LastName;
    const token = jwt.sign(
      {
        userId: user?.Id,
      },
      jwtSecretKey,
      { expiresIn: "1 day" }
    );

    let forgotPasswordUrl = `${environment.FRONTEND_URL}reset-password/user?accesstoken=${token}`;
    const mailObj = {
      email: user?.Email,
      subject: "freedom.social forgot password",
      root: "../email-templates/forgot-password.ejs",
      templateData: { name: name, url: forgotPasswordUrl },
    };

    const emailData = await email.sendMail(mailObj);
    return emailData;
  } else {
    return { error: "User not found with this email" };
  }
};

exports.executeQuery = async (query, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, function (err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};
