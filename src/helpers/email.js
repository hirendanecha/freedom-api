const ejs = require("ejs");
const nodemailer = require("nodemailer");
const path = require("path");
const environment = require("../environments/environment");

let transporter = nodemailer.createTransport({
  // tls: {
  //   host: "freedom.social",
  //   port: 993,
  // },
  service: "gmail",
  auth: {
    user: "freedom.buzzzz@gmail.com",
    pass: "jyfc bbxk utnv bbvk",
  },
  sender: "no-reply@freedom.buzz",
  // host: "smtp.freedom.social",
  // port: 465,
  // sender: "no-reply@freedom.buzz",
  // auth: { user: environment.SMTP_USER, pass: environment.SMTP_PASS },
});

exports.sendMail = async function (mailObj) {
  try {
    const emailTemplateSource = await ejs.renderFile(
      path.join(__dirname, mailObj.root),
      { ...mailObj.templateData }
    );
    return transporter.sendMail({
      from: {
        name: "Freedom Buzz",
        address: "no-reply@freedom.buzz",
      },
      to: mailObj.email,
      subject: mailObj.subject,
      html: emailTemplateSource,
    });
  } catch (error) {
    console.log("error while sending the mail", error);
    return error;
  }
};
