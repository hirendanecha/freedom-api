var express = require("express");
var router = express.Router();

const authRoutes = require("./user.routes");
const utilsRoutes = require("./utils.routes");
const postRoutes = require("./post.routes");
const adminRouter = require("./admin.routes");

router.use("/login", authRoutes);
router.use("/customers", authRoutes);
router.use("/admin", adminRouter);
router.use("/utils", utilsRoutes);
router.use("/posts", postRoutes);

module.exports = router;