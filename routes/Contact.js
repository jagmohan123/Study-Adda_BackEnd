const express = require("express");
const router = express.Router();
const { ContactControoler } = require("../controllers/Contact");

router.post("/contact", ContactControoler);
module.exports = router;
