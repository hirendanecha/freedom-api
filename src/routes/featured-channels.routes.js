const express = require("express");
const router = express.Router();
const featuredChannels = require("../controllers/featuredChannels.controller");

router.get("/", featuredChannels.getChannels);
router.get("/:id", featuredChannels.getMyChannels);
router.post("/posts", featuredChannels.getVideos);
router.get("/activate-channel", featuredChannels.channelsApprove);
router.post("/create-channel", featuredChannels.createChannel);

module.exports = router;
