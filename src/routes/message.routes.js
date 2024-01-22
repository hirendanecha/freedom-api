const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/message.controller");

router.post("/", messagesController.getMessages);

module.exports = router;
