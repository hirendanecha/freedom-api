const express = require("express");
const router = express.Router();
const profileController = require("./../controllers/profile.controller");
const authorize = require("../middleware/authorize");

router.use(authorize);
router.get("/groupsAndPosts", profileController.groupsAndPosts);
router.get("/getGroups", profileController.getGroups);
router.get(
  "/getGroupBasicDetails/:uniqueLink",
  profileController.getGroupBasicDetails
);
router.get("/getGroupPostById/:id", profileController.getGroupPostById);
router.get(
  "/getGroupFileResourcesById/:id",
  profileController.getGroupFileResourcesById
);

module.exports = router;
