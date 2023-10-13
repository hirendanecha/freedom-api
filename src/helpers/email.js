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
    user: "ua.opash@gmail.com",
    pass: "eglj cbzl qmnv drzq",
  },
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
      from: 'freedom.social@your-server.de',
      to: mailObj.email,
      subject: mailObj.subject,
      html: emailTemplateSource,
    });
  } catch (error) {
    console.log("error while sending the mail", error);
    return error;
  }
};
