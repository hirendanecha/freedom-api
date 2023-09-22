const express = require("express");
const router = express.Router();

const userRewardDetailsController = require("../controllers/userRewardDetails.controller");

router.get("/getCountByProfileId/:profileId", userRewardDetailsController.getCountByProfileId);

module.exports = router;
