const express = require("express");
const router = express.Router();

const seeFirstUserController = require("../controllers/seeFirstUser.controller");

router.post("/create", seeFirstUserController.create);
router.delete("/remove/:id", seeFirstUserController.remove);
router.get("/getByProfileId/:profileId", seeFirstUserController.getByProfileId);

module.exports = router;
