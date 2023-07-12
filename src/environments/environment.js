require("dotenv").config();
const environment = {
  production: false,
  BASE_URL2: process.env.BASE_URL2,
  BASE_URL: process.env.BASE_URL,
  API_URL2: process.env.API_URL2,
  API_URL: process.env.API_URL,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  FRONTEND_URL: process.env.FRONTEND_URL,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_EXPIRED: process.env.JWT_EXPIRED,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  X_CMC_PRO_API_KEY: process.env.X_CMC_PRO_API_KEY,
};

module.exports = environment;
