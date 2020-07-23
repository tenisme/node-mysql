const express = require("express");
const auth = require("../middleware/auth.js");

const router = express.Router();

const {
  getMemos,
  createMemo,
  updateMemo,
  deleteMemo,
} = require("../controllers/memos.js");

router.route("/").get(getMemos).post(createMemo);

router.route("/:id").put(updateMemo).delete(deleteMemo);

module.exports = router;
