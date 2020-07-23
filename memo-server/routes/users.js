const express = require("express");
const auth = require("../middleware/auth.js");

const {
  createUser,
  loginUser,
  getUserInfo,
  changePasswd,
} = require("../controllers/users.js");

const router = express.Router();

router.route("/signup").post(createUser);
router.route("/login").post(loginUser);
router.route("/my_info").get(auth, getUserInfo);
router.route("/change_password").put(auth, changePasswd);

module.exports = router;
