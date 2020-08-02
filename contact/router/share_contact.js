const express = require("express");

const {
  shareContact,
  viewSharedContacts,
  saveSharedContact,
  unShareContact,
  unShareContactsAll,
} = require("../controllers/share_contact.js");

const router = express.Router();

router
  .route("/")
  .post(shareContact)
  .get(viewSharedContacts)
  .delete(unShareContact);
router.route("/:share_contact_token").post(saveSharedContact);
router.route("/unshare_all").delete(unShareContactsAll);

module.exports = router;
