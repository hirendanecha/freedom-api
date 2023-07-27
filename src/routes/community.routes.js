const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const utilsController = require("../controllers/utils.controller");

router.get("/approve-community", communityController.findApproveCommunity);
router.get("/un-approve-community", communityController.findUnApproveCommunity);
router.get("/:id", communityController.findCommunityById);
// router.get("/:id", communityController.approveCommunity);
router.get("/files/:folder/:id", utilsController.getFiles);
router.post("/create", communityController.createCommunity);
router.get("/change-user-type/:id", communityController.changeAccountType);
router.delete("/:id", communityController.deleteCommunity);

module.exports = router;
