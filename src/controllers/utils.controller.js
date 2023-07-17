"use strict";

const formidable = require("formidable");
var fs = require("fs");
const utils = require("../helpers/utils");
const environment = require("../environments/environment");
const baseUrl = environment.BASE_URL;
const __upload_dir = environment.UPLOAD_DIR;

exports.fileupload = function (req, res) {
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    // oldpath : temporary folder to which file is saved to
    var oldpath = files.file.filepath;
    var parts = files.file.originalFilename.split(".");
    var extn = parts[parts.length - 1];
    var id = fields.id;
    var index = parts[0];
    var folder = fields.folder;
    var new_dir = __upload_dir + folder + "//" + id;

    if (!fs.existsSync(new_dir)) {
      fs.mkdirSync(new_dir, { recursive: true });
    } else {
      let files = fs.readdirSync(new_dir);
      let n = files.length;
      console.log("new_dir", new_dir, " files: ", n);
      // if (n === 4) n = 0;
      // index = n + parseInt(index);
    }

    var newpath = new_dir + "//" + index + "." + extn;
    try {
      fs.statSync(newpath);
      console.log("Deleting " + newpath);
      fs.unlinkSync(newpath);
    } catch (e) {
      console.log("File does not exist - " + newpath);
    }

    // copy the file to a new location
    fs.copyFile(oldpath, newpath, function (err) {
      if (err) throw err;
      // // you may respond with another html page
      // res.write('File uploaded and moved!');
      // res.end();
    });

    res.send({ success: true });
  });
};

exports.fileupload2 = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

exports.getFiles = (req, res) => {
  const dir = __upload_dir + "/" + req.params.folder + "/" + req.params.id;
  console.log(dir);
  fs.readdir(dir, function (err, files) {
    if (err) {
      return res.status(500).send({ message: "Unable to scan files!" });
    }
    console.log(files);
    let fileInfos = [];

    if (files && files.length > 0) {
      files.forEach((file) => {
        console.log(file);
        fileInfos.push({
          name: file,
          url:
            baseUrl +
            dir +
            "/" +
            file,
        });
      });
    }

    res.status(200).send(fileInfos);
  });
};

exports.download = (req, res) => {
  const paths = utils.getactualfilename(
    req.params.name,
    req.params.folder,
    req.params.id
  );
  res.download(paths[0] + "/" + paths[1], paths[1], (err) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Could not download the file. " + err });
    }
  });
};
exports.downloadPartner = (req, res) => {
  const path = __upload_dir + "partner" + "/" + req.params.name;
  return res.download(path, req.params.name, (err) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Could not download the file. " + err });
    }
  });
};

exports.fileuploadForPartnerProfile = async function (req, res) {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    const { domain } = fields;
    let partner = await Partner.findOneByDomain(domain);
    var id = partner[0]?.user_id;
    var oldpath = files.file.filepath;
    var new_dir = __upload_dir + "partner";
    var timestamp = new Date().getTime();
    var parts = files.file.originalFilename.split(".");
    var extn = parts[parts.length - 1];
    var filenameNew = id + "-" + timestamp + "." + extn;
    if (partner[0].user_partner_image) {
      let filename = partner[0].user_partner_image;
      var existing_file_path = new_dir + "//" + filename;
      fs.unlinkSync(existing_file_path);
    }
    var existing_file_path = new_dir + "//" + filenameNew;
    fs.mkdirSync(new_dir, { recursive: true });
    await Partner.updateProfilePicture(filenameNew, partner[0].user_id);
    var newpath = new_dir + "//" + filenameNew;

    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
    });
    res.send({ success: true });
  });
};
