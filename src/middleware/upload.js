// const util = require("util");
// const multer = require("multer");
// const path = require("path");
// const maxSize = 0.1 * 1024 * 1024;
// const fs = require("fs");

// const folderName = path.join(__dirname, "../uploads");
// if (!fs.existsSync(folderName)) {
//   fs.mkdirSync(folderName);
// }

// let storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null,"uploads");
//   },
//   filename: (req, file, cb) => {
//     console.log(file.originalname);
//     cb(null, file.originalname);
//   },
// });

// let uploadFile = multer({
//   storage: storage,
//   // limits: { fileSize: maxSize },
// }).single("file");

// let uploadFileMiddleware = util.promisify(uploadFile);

// module.exports = uploadFileMiddleware;

const multer = require("multer");
const fs = require("fs");
var path = require("path");

const folderName = path.join(__dirname, "../uploads");
if (!fs.existsSync(folderName)) {
  fs.mkdirSync(folderName);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folderName);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadFileMiddleware = multer({ storage: storage });
module.exports = uploadFileMiddleware;
//====================
