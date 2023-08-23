var express = require("express");
var router = express.Router();

const authRoutes = require("./user.routes");
const utilsRoutes = require("./utils.routes");
const postRoutes = require("./post.routes");
const adminRouter = require("./admin.routes");
const communityRouter = require("./community.routes");
const communityPostRouter = require("./community-post.routes");
const unsubscribeProfileRouter = require("./unsubscribeProfile.routes");
const seeFirstUserRouter = require("./seeFirstUser.routes");

router.use("/login", authRoutes);
router.use("/customers", authRoutes);
router.use("/admin", adminRouter);
router.use("/utils", utilsRoutes);
router.use("/posts", postRoutes);
router.use("/community", communityRouter);
router.use("/community-post", communityPostRouter);
router.use("/unsubscribe-profile", unsubscribeProfileRouter);
router.use("/see-first-user", seeFirstUserRouter);

module.exports = router;
