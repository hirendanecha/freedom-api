const express = require("express");
const router = express.Router();
const utilsController = require("../controllers/utils.controller");
const uploadFileMiddleware = require("../middleware/upload");
const authorize = require("../middleware/authorize");

router.post(
  "/image-upload",
  uploadFileMiddleware.single("file"),
  utilsController.uploadVideo
);

router.get("/files/:folder/:id", utilsController.getFiles);
router.use(authorize);
router.post("/upload", utilsController.fileupload);
// router.post("/upload2", utilsController.fileupload2);
router.get("/download/partner/:name", utilsController.downloadPartner);
router.get("/download/:folder/:id/:name", utilsController.download);
router.get("/:folder/:id/:filename", utilsController.readFile);

module.exports = router;
