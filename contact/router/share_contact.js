const express = require("express");

const {
  shareContacts,
  unShareContacts,
} = require("../controllers/share_contact.js");

const router = express.Router();

router.route("/").post(shareContacts).delete(unShareContacts);

module.exports = router;
