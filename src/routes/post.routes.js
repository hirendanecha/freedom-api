const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const utilsController = require("../controllers/utils.controller");

router.get("/", postController.findAll);
router.get("/get-meta", postController.getMeta);
router.post("/create", postController.createPost);
router.post("/upload-post", utilsController.uploadPostImage);
router.get("/files/:folder/:id", utilsController.getFiles);
router.get("/:folder/:id/:filename", utilsController.readFile);

module.exports = router;
