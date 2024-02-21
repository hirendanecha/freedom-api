const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/message.controller");
const authorize = require("../middleware/authorize");

router.use(authorize);
router.post("/", messagesController.getMessages);
router.get("/get-members/:id", messagesController.getMembers);

module.exports = router;
