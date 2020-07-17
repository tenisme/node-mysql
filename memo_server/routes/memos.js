const express = require("express");

const router = express.Router();

// controllers에서 함수 가져오기
const {
  getMemos,
  getMemo,
  createMemo,
  updateMemo,
  deleteMemo,
} = require("../controllers/memos.js");

// 각 경로별로 데이터를 가져올 수 있도록 router를 셋팅한다.
router.route("/").get(getMemos);
router.route("/:id").get(getMemo).delete(deleteMemo);
router.route("/:title/:content").post(createMemo);
router.route("/:id/:title/:content").put(updateMemo);

module.exports = router;
