const express = require("express");
const router = express.Router();

const unsubscribeProfileController = require("../controllers/unsubscribeProfile.controller");

router.post("/create", unsubscribeProfileController.create);
router.delete("/remove/:id", unsubscribeProfileController.remove);
router.get("/getByProfileId/:profileId", unsubscribeProfileController.getByProfileId);

module.exports = router;
