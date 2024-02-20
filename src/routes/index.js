var express = require("express");
var router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const utilsRoutes = require("./utils.routes");
const postRoutes = require("./post.routes");
const adminRouter = require("./admin.routes");
const communityRouter = require("./community.routes");
const communityPostRouter = require("./community-post.routes");
const unsubscribeProfileRouter = require("./unsubscribeProfile.routes");
const userRewardDetailsRouter = require("./userRewardDetails.routes");
const seeFirstUserRouter = require("./seeFirstUser.routes");
const profileRouter = require("./profile.routes");
const dashboardRouter = require("./dashboard.routes");
const featuredChannels = require("./featured-channels.routes");
const messageRouter = require("./message.routes");
const authorize = require("../middleware/authorize");

router.use("/login", authRoutes);
router.use("/admin", adminRouter);
// router.use(authorize);
router.use("/posts", postRoutes);
router.use("/customers", userRoutes);
router.use("/utils", utilsRoutes);
router.use("/community", communityRouter);
router.use("/community-post", communityPostRouter);
router.use("/unsubscribe-profile", unsubscribeProfileRouter);
router.use("/user-reward-details", userRewardDetailsRouter);
router.use("/see-first-user", seeFirstUserRouter);
router.use("/profile", profileRouter);
router.use("/dashboard", dashboardRouter);
// Freedom tube routes //
router.use("/channels", featuredChannels);
router.use("/messages", messageRouter);

module.exports = router;
