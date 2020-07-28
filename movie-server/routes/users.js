const express = require("express");
const auth = require("../middleware/auth.js");

const {
  createUser,
  login,
  deleteUser,
  updatePasswd,
  forgotPasswd,
  resetPasswd,
} = require("../controllers/users.js");

const router = express.Router();

router.route("/").post(createUser).delete(auth, deleteUser);
router.route("/login").post(login);
router.route("/updatepasswd").put(auth, updatePasswd);
router.route("/forgotpasswd").post(forgotPasswd);
router.route("/resetpasswd/:resetPasswdToken").post(resetPasswd);

module.exports = router;
