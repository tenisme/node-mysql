const express = require("express");
const router = express.Router();

// 모든 주소록 가져오기
router.get("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

// 연락처 추가
router.post("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

// 연락처 수정 - id값은 바디로 받는다
router.put("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

// 연락처 삭제 - id값은 바디로 받는다
router.delete("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

module.exports = router;
