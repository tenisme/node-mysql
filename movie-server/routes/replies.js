const express = require("express");
const auth = require("../middleware/auth.js");

const {
  replyMovie,
  updateReply,
  deleteReply,
  getReplies,
} = require("../controllers/replies.js");

const router = express.Router();

router
  .route("/")
  .post(auth, replyMovie)
  .put(auth, updateReply)
  .delete(auth, deleteReply)
  .get(getReplies);

module.exports = router;
