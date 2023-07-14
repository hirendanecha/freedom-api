const environment = require("../environments/environment");
const email = require("./email");
const jwt = require("jsonwebtoken");

const __upload_dir = environment.UPLOAD_DIR;
var fs = require("fs");
const db = require("../../config/db.config");
const baseUrl = environment.API_URL + "utils";

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

exports.orderAutoMail = async (items) => {
  let totalAmount = 0;
  let buyerArray = [];

  const sellerObject = items.reduce((prev, current) => {
    buyerArray.push({
      productName: current.product_title,
      sellerName: current.user_first_name + " " + current.user_last_name,
      buyerName:
        current.buyer.user_first_name + " " + current.buyer.user_last_name,
      sellerEmail: current.user_email,
      unitPrice: current.sell_currency + current.sell_unit_price,
      qty: current.sell_quantity + " " + current.product_unit,
      totalCost: current.sell_currency + current.sell_total_cost,
      sell_currency: current.sell_currency,
      product_img: `${baseUrl}/download/product/${current.product_id}/0.jpg`,
      orderItem: current,
    });
    totalAmount = totalAmount + current.sell_total_cost;
    const objectToAdd = {
      buyerEmail: current.user_email,
      sellerName: current.user_first_name + " " + current.user_last_name,
      buyerName:
        current.buyer.user_first_name + " " + current.buyer.user_last_name,
      unitPrice:
        current.sell_currency +
        current.sell_unit_price +
        " per " +
        current.product_unit,
      qty: current.sell_quantity,
      totalCost: current.sell_total_cost,
      sell_currency: current.sell_currency,
      product_img: `${baseUrl}/download/product/${current.product_id}/0.jpg`,
      orderItem: current,
    };

    if (prev[current.user_id] && prev[current.user_id].length) {
      prev[current.user_id].push(objectToAdd);
    } else {
      prev[current.user_id] = [objectToAdd];
    }
    return prev;
  }, {});

  const mailsArray = [];
  mailsArray.push({
    email: items[0].buyer.user_email,
    subject: "Product purchased",
    root: "../email-templates/product-purchased.ejs",
    templateData: {
      name: buyerArray[0].buyerName,
      totalAmount: `${buyerArray[0].sell_currency}${totalAmount}`,
      orders: buyerArray,
    },
  });

  Object.keys(sellerObject).forEach((key) => {
    let finalAmount;
    sellerObject[key].forEach((obj) => {
      finalAmount = (finalAmount || 0) + obj["totalCost"];
    });

    mailsArray.push({
      email: sellerObject[key][0].buyerEmail,
      subject: "Product sold",
      root: "../email-templates/product-sold.ejs",
      templateData: {
        name: sellerObject[key][0].sellerName,
        finalAmount: `${sellerObject[key][0].sell_currency}${finalAmount}`,
        orders: sellerObject[key],
      },
    });
  });
  const promises = mailsArray.map((ele) => email.sendMail(ele));
  const results = await Promise.all(promises);

  return;
};

exports.registrationMail = async (userData, userId) => {
  let jwtSecretKey = environment.JWT_SECRET_KEY;
  let name = userData.FirstName + " " + userData.LastName;

  const token = jwt.sign(
    {
      userId: userId,
      email: userData.UserName,
    },
    jwtSecretKey,
    { expiresIn: "730 days" }
  );

  let registerUrl = `${environment.API_URL}customers/user/verification/${token}`;

  const mailObj = {
    email: userData.UserName,
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
      email: userData.UserName,
    },
    jwtSecretKey,
    { expiresIn: "730 days" }
  );

  let registerUrl = `${environment.API_URL}customers/user/verification/${token}`;

  const mailObj = {
    email: userData.UserName,
    subject: "Registration",
    root: "../email-templates/partner-registration.ejs",
    templateData: { name: name, url: registerUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.forgotPasswordMail = async (user) => {
  console.log(user);
  if (user.length) {
    let jwtSecretKey = environment.JWT_SECRET_KEY;
    let name = user[0]?.FirstName + " " + user[0]?.LastName;
    const token = jwt.sign(
      {
        userId: user[0]?.Id,
      },
      jwtSecretKey,
      { expiresIn: environment.JWT_EXPIRED }
    );

    let forgotPasswordUrl = `${environment.API_URL}/set-password/user?accesstoken=${token}`;
    const mailObj = {
      email: user[0]?.UserName,
      subject: "forgot password",
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
