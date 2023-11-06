const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const utilsController = require("../controllers/utils.controller");
const uploadFileMiddleware = require("../middleware/upload");

router.post("/", postController.findAll);
router.post("/get-my-post", postController.getPostByProfileId);
router.get("/get/:id", postController.getPostByPostId);
router.get("/get-pdfs/:id", postController.getPdfsFile);
router.post("/comments/", postController.getPostComments);
router.post("/get-meta", postController.getMeta);
router.post("/create-post", postController.createPost);
router.post(
  "/upload",
  uploadFileMiddleware.single("file"),
  postController.uploadVideo
);
router.post("/upload-post", utilsController.uploadPostImage);
router.post("/update-views/:id", postController.updateViewCount);
router.get("/files/:folder/:id", utilsController.getFiles);
router.get("/:folder/:id/:filename", utilsController.readFile);
router.delete("/:id", postController.deletePost);
router.delete("/comments/:id", postController.deletePostComment);
router.delete("/delete-all/:id", postController.deleteAllData);

module.exports = router;
