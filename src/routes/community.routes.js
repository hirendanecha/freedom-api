const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const utilsController = require("../controllers/utils.controller");

router.get("/approve-community", communityController.findApproveCommunity);
router.get("/un-approve-community", communityController.findUnApproveCommunity);
router.get("/search", communityController.search);
router.get("/:id", communityController.findCommunityById);
router.get("/status/:id", communityController.approveCommunity);
router.get("/files/:folder/:id", utilsController.getFiles);
router.post("/create", communityController.createCommunity);
router.get("/change-user-type/:id", communityController.changeAccountType);
router.post("/create-community-admin", communityController.createCommunityAdmin);
router.delete("/:id", communityController.deleteCommunity);

module.exports = router;
