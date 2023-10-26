const express = require("express");
const router = express.Router();
const featuredChannels = require("../controllers/featuredChannels.controller");

router.get("/", featuredChannels.getChannels);
router.get("/:name", featuredChannels.getChannelById);
router.get("/my-channel/:id", featuredChannels.getChannelByUserId);
router.get("/post/:id", featuredChannels.getPostDetails);
router.get("/activate-channel", featuredChannels.channelsApprove);
router.get("/feature/:id", featuredChannels.updateChannleFeature);
router.post("/search-all", featuredChannels.searchAllData);
router.post("/get", featuredChannels.getAllChannels);
router.post("/posts", featuredChannels.getVideos);
router.post("/my-posts", featuredChannels.getChannelVideos);
router.post("/create-channel", featuredChannels.createChannel);
router.delete("/:id", featuredChannels.deleteChannel);

module.exports = router;
