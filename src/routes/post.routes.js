const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const utilsController = require("../controllers/utils.controller");
const uploadFileMiddleware = require("../middleware/upload");

router.post("/", postController.findAll);
router.get("/:id", postController.getPostByProfileId);
router.get("/get/:id", postController.getPostByPostId);
router.get("/comments/:id", postController.getPostComments);
router.post("/get-meta", postController.getMeta);
router.post("/create", postController.createPost);
router.post(
  "/upload-video",
  uploadFileMiddleware.single("file"),
  postController.uploadVideo
);
router.post("/upload-post", utilsController.uploadPostImage);
router.get("/files/:folder/:id", utilsController.getFiles);
router.get("/:folder/:id/:filename", utilsController.readFile);
router.delete("/:id", postController.deletePost);
router.delete("/comments/:id", postController.deletePostComment);
router.delete("/delete-all/:id", postController.deleteAllData);

module.exports = router;
