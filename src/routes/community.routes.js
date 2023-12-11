const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const utilsController = require("../controllers/utils.controller");

router.get("/", communityController.getCommunity);
router.get(
  "/get-communities-pages/:id",
  communityController.getLocalCommunities
);
router.post("/all-community", communityController.findAllCommunity);
// router.get("/un-approve-community", communityController.findUnApproveCommunity);
router.get("/search", communityController.search);
router.get("/:id", communityController.findCommunityById);
router.get("/bySlug/:slug", communityController.findCommunityBySlug);
router.get("/user/:id", communityController.getCommunityByUserId);
router.get(
  "/joined-community/:id",
  communityController.getJoinedCommunityByProfileId
);
router.get("/get-link/:id", communityController.getLink);
router.get("/status/:id", communityController.approveCommunity);
router.get("/change-user-type/:id", communityController.changeAccountType);
router.get("/files/:folder/:id", utilsController.getFiles);
router.post("/upload-community", utilsController.uploadPostImage);
router.post("/create", communityController.createCommunity);
router.post(
  "/create-advertizement-link",
  communityController.CreateAdvertizementLink
);
router.post(
  "/edit-advertizement-link",
  communityController.editAdvertizeMentLink
);

router.put("/edit/:id", communityController.editCommunity);
router.post("/join-community", communityController.joinCommunity);
router.post(
  "/create-community-admin-by-MA",
  communityController.createCommunityAdminByMA
);
router.put("/create-community-admin", communityController.createCommunityAdmin);
router.delete("/leave", communityController.leaveFromCommunity);
router.delete("/:id", communityController.deleteCommunity);

module.exports = router;
