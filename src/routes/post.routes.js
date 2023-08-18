const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const utilsController = require("../controllers/utils.controller");

router.get("/", postController.findAll);
router.get("/:id", postController.getPostByProfileId);
router.get("/get/:id", postController.getPostByPostId);
router.post("/get-meta", postController.getMeta);
router.post("/create", postController.createPost);
router.post("/upload-post", utilsController.uploadPostImage);
router.get("/files/:folder/:id", utilsController.getFiles);
router.get("/:folder/:id/:filename", utilsController.readFile);
router.delete("/:id", postController.deletePost);

module.exports = router;
