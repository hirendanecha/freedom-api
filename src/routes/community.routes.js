const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const utilsController = require("../controllers/utils.controller");

router.get("/", communityController.findAll);
router.post("/create", communityController.createCommunity);
router.get("/files/:folder/:id", utilsController.getFiles);
router.put("/:id", communityController.approveCommunity);
router.put("change-user-type/:id", communityController.changeAccountType);

module.exports = router;
