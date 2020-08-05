const express = require("express");

const {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  searchContact,
} = require("../controllers/contact.js");

const router = express.Router();

router
  .route("/")
  .get(getContacts)
  .post(createContact)
  .put(updateContact)
  .delete(deleteContact);
router.route("/search").get(searchContact);

module.exports = router;
